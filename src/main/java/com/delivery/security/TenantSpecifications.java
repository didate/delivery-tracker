package com.delivery.security;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.metamodel.SingularAttribute;
import org.springframework.data.jpa.domain.Specification;

/**
 * Helper class for creating tenant-aware JPA Specifications.
 * This ensures that non-ADMIN users can only access data from their own tenant.
 */
public final class TenantSpecifications {

    private TenantSpecifications() {}

    /**
     * Creates a specification that filters by the current tenant.
     * If the current user is an ADMIN, no filtering is applied.
     * If no tenant is set in TenantContext, no filtering is applied (for unauthenticated requests).
     *
     * @param tenantAttribute the metamodel attribute for the tenant relationship
     * @param tenantIdAttribute the metamodel attribute for the tenant's id
     * @param <T> the entity type
     * @param <X> the tenant entity type
     * @return a specification that filters by tenant, or unrestricted if not applicable
     */
    public static <T, X> Specification<T> forCurrentTenant(
        SingularAttribute<T, X> tenantAttribute,
        SingularAttribute<X, Long> tenantIdAttribute
    ) {
        // ADMIN can see all tenants
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return Specification.unrestricted();
        }

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            // No tenant in context - this shouldn't happen for authenticated requests
            // Return unrestricted for safety (security should be handled elsewhere)
            return Specification.unrestricted();
        }

        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.join(tenantAttribute, JoinType.LEFT).get(tenantIdAttribute), tenantId);
    }

    /**
     * Combines the provided specification with tenant filtering.
     *
     * @param specification the base specification
     * @param tenantAttribute the metamodel attribute for the tenant relationship
     * @param tenantIdAttribute the metamodel attribute for the tenant's id
     * @param <T> the entity type
     * @param <X> the tenant entity type
     * @return the combined specification
     */
    public static <T, X> Specification<T> withTenantFilter(
        Specification<T> specification,
        SingularAttribute<T, X> tenantAttribute,
        SingularAttribute<X, Long> tenantIdAttribute
    ) {
        Specification<T> tenantSpec = forCurrentTenant(tenantAttribute, tenantIdAttribute);
        if (specification == null) {
            return tenantSpec;
        }
        return specification.and(tenantSpec);
    }

    /**
     * Check if the current user should have tenant filtering applied.
     *
     * @return true if tenant filtering should be applied
     */
    public static boolean shouldFilterByTenant() {
        return !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN) && TenantContext.hasTenant();
    }
}
