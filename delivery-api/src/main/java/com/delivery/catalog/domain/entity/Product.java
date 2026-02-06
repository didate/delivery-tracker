package com.delivery.catalog.domain.entity;

import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products", uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_tenant_code", columnNames = {"tenant_id", "code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
