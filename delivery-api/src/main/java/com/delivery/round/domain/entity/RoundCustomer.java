package com.delivery.round.domain.entity;

import com.delivery.customer.domain.entity.Customer;
import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "round_customers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_round_customer", columnNames = {"round_id", "customer_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundCustomer extends BaseEntity {

    @Column(name = "round_id", nullable = false)
    private UUID roundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", insertable = false, updatable = false)
    private Round round;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(nullable = false)
    @Builder.Default
    private boolean visited = false;

    @Column(name = "visit_time")
    private LocalTime visitTime;

    @Column(name = "delivery_id")
    private UUID deliveryId;
}
