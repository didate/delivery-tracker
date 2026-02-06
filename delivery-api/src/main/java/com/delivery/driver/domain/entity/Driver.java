package com.delivery.driver.domain.entity;

import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "drivers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_drivers_tenant_license", columnNames = {"tenant_id", "license_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "license_number", nullable = false, length = 50)
    private String licenseNumber;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "production_site_id")
    private UUID productionSiteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_site_id", insertable = false, updatable = false)
    private ProductionSite productionSite;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
