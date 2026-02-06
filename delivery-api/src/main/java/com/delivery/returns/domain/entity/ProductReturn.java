package com.delivery.returns.domain.entity;

import com.delivery.customer.domain.entity.Customer;
import com.delivery.driver.domain.entity.Driver;
import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_returns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReturn extends BaseEntity {

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", insertable = false, updatable = false)
    private Driver driver;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "productReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReturnItem> items = new ArrayList<>();

    public void addItem(ReturnItem item) {
        items.add(item);
        item.setProductReturn(this);
        item.setReturnId(this.getId());
    }

    public void removeItem(ReturnItem item) {
        items.remove(item);
        item.setProductReturn(null);
        item.setReturnId(null);
    }
}
