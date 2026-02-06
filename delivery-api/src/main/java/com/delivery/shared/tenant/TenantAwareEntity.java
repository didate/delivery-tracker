package com.delivery.shared.tenant;

import com.delivery.shared.domain.AbstractAuditingEntity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@MappedSuperclass
@Getter
@Setter
public abstract class TenantAwareEntity<T> extends AbstractAuditingEntity<T> {

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @PrePersist
    public void prePersist() {
        if (tenantId == null) {
            tenantId = TenantContext.getCurrentTenant();
        }
    }
}
