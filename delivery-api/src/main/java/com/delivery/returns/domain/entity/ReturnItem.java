package com.delivery.returns.domain.entity;

import com.delivery.catalog.domain.entity.Product;
import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "return_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnItem extends BaseEntity {

    @Column(name = "return_id", nullable = false)
    private UUID returnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", insertable = false, updatable = false)
    private ProductReturn productReturn;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReturnReason reason;

    @Column(name = "unit_value", precision = 15, scale = 2)
    private BigDecimal unitValue;
}
