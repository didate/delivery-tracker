package com.delivery.expense.application.dto;

import com.delivery.expense.domain.entity.ExpenseCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
public class ExpenseSummaryResponse {

    private BigDecimal totalAmount;
    private Long totalCount;
    private Map<ExpenseCategory, BigDecimal> totalByCategory;
    private LocalDate startDate;
    private LocalDate endDate;
}
