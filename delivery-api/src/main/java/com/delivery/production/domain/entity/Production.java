package com.delivery.production.domain.entity;

import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "productions", indexes = {
        @Index(name = "idx_productions_tenant", columnList = "tenant_id"),
        @Index(name = "idx_productions_production_site", columnList = "production_site_id"),
        @Index(name = "idx_productions_product", columnList = "product_id"),
        @Index(name = "idx_productions_date", columnList = "production_date"),
        @Index(name = "idx_productions_tenant_site_date", columnList = "tenant_id, production_site_id, production_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Production extends BaseEntity {

    @Column(name = "production_site_id", nullable = false)
    private UUID productionSiteId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
