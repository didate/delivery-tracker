package com.delivery.identity.domain.service;

import com.delivery.identity.domain.entity.Role;
import com.delivery.identity.domain.entity.User;
import com.delivery.identity.domain.repository.UserRepository;
import com.delivery.shared.exception.DuplicateResourceException;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(String email, String password, String name, Role role) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (userRepository.existsByTenantIdAndEmail(tenantId, email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .active(true)
                .build();
        user.setTenantId(tenantId);

        return userRepository.save(user);
    }

    @Transactional
    public User createUserForTenant(UUID tenantId, String email, String password, String name, Role role) {
        if (userRepository.existsByTenantIdAndEmail(tenantId, email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .active(true)
                .build();
        user.setTenantId(tenantId);

        return userRepository.save(user);
    }

    public User getUserById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User getUserByEmail(String email) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return userRepository.findByTenantIdAndEmail(tenantId, email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public Page<User> getAllUsers(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return userRepository.findAllByTenantId(tenantId, pageable);
    }

    @Transactional
    public User updateUser(UUID id, String name, Role role, Boolean active) {
        User user = getUserById(id);

        if (name != null) {
            user.setName(name);
        }
        if (role != null) {
            user.setRole(role);
        }
        if (active != null) {
            user.setActive(active);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updatePassword(UUID id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = getUserById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(UUID id) {
        User user = getUserById(id);
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}
