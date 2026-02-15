package com.delivery.security;

/**
 * Context holder for the current tenant.
 * Uses ThreadLocal to store the tenant ID for the current request.
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {}

    /**
     * Set the current tenant ID for this thread.
     *
     * @param tenantId the tenant ID
     */
    public static void setCurrentTenant(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /**
     * Get the current tenant ID for this thread.
     *
     * @return the tenant ID, or null if not set
     */
    public static Long getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    /**
     * Clear the current tenant ID.
     * Should be called at the end of each request to prevent memory leaks.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
    }

    /**
     * Check if a tenant is set for the current thread.
     *
     * @return true if a tenant is set
     */
    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }
}
