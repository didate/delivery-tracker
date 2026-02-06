package com.delivery.shared.config;

import com.delivery.shared.security.UserPrincipal;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityAuditorAware implements AuditorAware<String> {

    private static final String SYSTEM_ACCOUNT = "system";

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.of(SYSTEM_ACCOUNT);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal userPrincipal) {
            return Optional.of(userPrincipal.getEmail());
        }

        if (principal instanceof String principalString) {
            if ("anonymousUser".equals(principalString)) {
                return Optional.of(SYSTEM_ACCOUNT);
            }
            return Optional.of(principalString);
        }

        return Optional.of(SYSTEM_ACCOUNT);
    }
}
