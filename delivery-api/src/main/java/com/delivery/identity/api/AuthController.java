package com.delivery.identity.api;

import com.delivery.identity.application.dto.LoginRequest;
import com.delivery.identity.application.dto.LoginResponse;
import com.delivery.identity.application.dto.RefreshTokenRequest;
import com.delivery.identity.application.dto.UserResponse;
import com.delivery.identity.application.mapper.UserMapper;
import com.delivery.identity.domain.service.AuthService;
import com.delivery.tenant.application.dto.RegisterTenantRequest;
import com.delivery.tenant.application.dto.TenantRegistrationResponse;
import com.delivery.tenant.application.mapper.TenantMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and registration APIs")
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;
    private final TenantMapper tenantMapper;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthResult result = authService.login(request.getEmail(), request.getPassword());

        UserResponse userResponse = userMapper.toResponse(
                com.delivery.identity.domain.entity.User.builder()
                        .email(result.user().getEmail())
                        .name(result.user().getEmail())
                        .role(com.delivery.identity.domain.entity.Role.valueOf(result.user().getRole()))
                        .active(result.user().isActive())
                        .build()
        );
        userResponse.setId(result.user().getId());
        userResponse.setTenantId(result.user().getTenantId());

        LoginResponse response = LoginResponse.of(
                result.accessToken(),
                result.refreshToken(),
                userResponse
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthService.AuthResult result = authService.refreshToken(request.getRefreshToken());

        UserResponse userResponse = userMapper.toResponseFromPrincipal(result.user());

        LoginResponse response = LoginResponse.of(
                result.accessToken(),
                result.refreshToken(),
                userResponse
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new tenant with owner account")
    public ResponseEntity<TenantRegistrationResponse> registerTenant(@Valid @RequestBody RegisterTenantRequest request) {
        AuthService.TenantRegistrationResult result = authService.registerTenant(
                request.getCompanyName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getOwnerName()
        );

        TenantRegistrationResponse response = TenantRegistrationResponse.builder()
                .tenant(tenantMapper.toResponse(result.tenant()))
                .accessToken(result.accessToken())
                .refreshToken(result.refreshToken())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
