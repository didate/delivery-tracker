package com.delivery.web.filter;

import com.delivery.security.SecurityUtils;
import com.delivery.security.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter that extracts the tenant ID from the JWT token and sets it in TenantContext.
 * This filter runs after the security filter chain has authenticated the user.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 100)
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            // Extract tenant ID from JWT claims
            SecurityUtils.getCurrentUserTenantId().ifPresent(TenantContext::setCurrentTenant);

            filterChain.doFilter(request, response);
        } finally {
            // Always clear the context to prevent memory leaks
            TenantContext.clear();
        }
    }
}
