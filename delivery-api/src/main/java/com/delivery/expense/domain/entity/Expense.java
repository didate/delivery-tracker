package com.delivery.expense.domain.entity;

import com.delivery.driver.domain.entity.Driver;
import com.delivery.driver.domain.entity.ProductionSite;
import com.delivery.shared.tenant.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExpenseCategory category;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "driver_id")
    private UUID driverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", insertable = false, updatable = false)
    private Driver driver;

    @Column(name = "production_site_id")
    private UUID productionSiteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_site_id", insertable = false, updatable = false)
    private ProductionSite productionSite;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
