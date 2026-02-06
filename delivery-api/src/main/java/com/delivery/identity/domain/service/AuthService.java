package com.delivery.identity.domain.service;

import com.delivery.identity.domain.entity.Role;
import com.delivery.identity.domain.entity.User;
import com.delivery.identity.domain.repository.UserRepository;
import com.delivery.shared.exception.UnauthorizedException;
import com.delivery.shared.security.JwtTokenProvider;
import com.delivery.shared.security.UserPrincipal;
import com.delivery.tenant.domain.entity.Tenant;
import com.delivery.tenant.domain.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final TenantService tenantService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResult login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("User account is deactivated");
        }

        Tenant tenant = tenantService.getActiveTenantById(user.getTenantId());
        if (tenant == null || !tenant.isActive()) {
            throw new UnauthorizedException("Tenant account is deactivated");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getTenantId(),
                user.getEmail(),
                user.getRole().name()
        );

        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(),
                user.getTenantId()
        );

        return new AuthResult(accessToken, refreshToken, toUserPrincipal(user));
    }

    @Transactional
    public AuthResult refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        UUID tenantId = jwtTokenProvider.getTenantIdFromToken(refreshToken);

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("User account is deactivated");
        }

        Tenant tenant = tenantService.getActiveTenantById(tenantId);
        if (tenant == null || !tenant.isActive()) {
            throw new UnauthorizedException("Tenant account is deactivated");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getTenantId(),
                user.getEmail(),
                user.getRole().name()
        );

        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(),
                user.getTenantId()
        );

        return new AuthResult(newAccessToken, newRefreshToken, toUserPrincipal(user));
    }

    @Transactional
    public TenantRegistrationResult registerTenant(String companyName, String email, String password, String phone, String ownerName) {
        Tenant tenant = tenantService.createTenant(companyName, email, phone);

        User ownerUser = userService.createUserForTenant(
                tenant.getId(),
                email,
                password,
                ownerName,
                Role.OWNER
        );

        String accessToken = jwtTokenProvider.generateAccessToken(
                ownerUser.getId(),
                tenant.getId(),
                ownerUser.getEmail(),
                ownerUser.getRole().name()
        );

        String refreshToken = jwtTokenProvider.generateRefreshToken(
                ownerUser.getId(),
                tenant.getId()
        );

        return new TenantRegistrationResult(tenant, ownerUser, accessToken, refreshToken);
    }

    private UserPrincipal toUserPrincipal(User user) {
        return UserPrincipal.builder()
                .id(user.getId())
                .tenantId(user.getTenantId())
                .email(user.getEmail())
                .password(user.getPassword())
                .role(user.getRole().name())
                .active(user.isActive())
                .build();
    }

    public record AuthResult(String accessToken, String refreshToken, UserPrincipal user) {}

    public record TenantRegistrationResult(Tenant tenant, User user, String accessToken, String refreshToken) {}
}
