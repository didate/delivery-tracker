package com.delivery.tenant.domain.entity;

import com.delivery.shared.domain.AbstractAuditingEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tenant_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id", "setting_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantSettings extends AbstractAuditingEntity<UUID> {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "setting_key", nullable = false, length = 100)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;

    @Override
    public UUID getId() {
        return id;
    }
}
