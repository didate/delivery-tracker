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
     * All users (including ADMIN) operate within their current tenant context.
     * ADMIN users can switch tenants via the tenant switcher.
     *
     * @param tenantAttribute the metamodel attribute for the tenant relationship
     * @param tenantIdAttribute the metamodel attribute for the tenant's id
     * @param <T> the entity type
     * @param <X> the tenant entity type
     * @return a specification that filters by tenant, or unrestricted if no tenant context
     */
    public static <T, X> Specification<T> forCurrentTenant(
        SingularAttribute<T, X> tenantAttribute,
        SingularAttribute<X, Long> tenantIdAttribute
    ) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            // No tenant in context - return empty result for safety
            return (root, query, criteriaBuilder) -> criteriaBuilder.disjunction();
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
     * Check if tenant filtering should be applied.
     * Always returns true if a tenant context exists.
     *
     * @return true if tenant filtering should be applied
     */
    public static boolean shouldFilterByTenant() {
        return TenantContext.hasTenant();
    }
}
