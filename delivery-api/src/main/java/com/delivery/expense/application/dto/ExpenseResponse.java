package com.delivery.expense.application.dto;

import com.delivery.expense.domain.entity.ExpenseCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ExpenseResponse {

    private UUID id;
    private String description;
    private BigDecimal amount;
    private ExpenseCategory category;
    private LocalDate expenseDate;
    private UUID driverId;
    private String driverName;
    private UUID productionSiteId;
    private String productionSiteName;
    private String notes;
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
}
