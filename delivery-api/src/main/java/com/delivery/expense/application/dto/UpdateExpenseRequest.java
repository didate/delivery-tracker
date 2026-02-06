package com.delivery.expense.application.dto;

import com.delivery.expense.domain.entity.ExpenseCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateExpenseRequest {

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 integer digits and 2 decimal places")
    private BigDecimal amount;

    private ExpenseCategory category;

    @PastOrPresent(message = "Expense date cannot be in the future")
    private LocalDate expenseDate;

    private UUID driverId;

    private UUID productionSiteId;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
