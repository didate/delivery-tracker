package com.delivery.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.Expense} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ExpenseDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate expenseDate;

    @NotNull
    private BigDecimal amount;

    @Lob
    private String description;

    @Size(max = 500)
    private String receiptUrl;

    @NotNull
    private ExpenseCategoryDTO category;

    private DriverDTO driver;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public ExpenseCategoryDTO getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategoryDTO category) {
        this.category = category;
    }

    public DriverDTO getDriver() {
        return driver;
    }

    public void setDriver(DriverDTO driver) {
        this.driver = driver;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ExpenseDTO)) {
            return false;
        }

        ExpenseDTO expenseDTO = (ExpenseDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, expenseDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ExpenseDTO{" +
            "id=" + getId() +
            ", expenseDate='" + getExpenseDate() + "'" +
            ", amount=" + getAmount() +
            ", description='" + getDescription() + "'" +
            ", receiptUrl='" + getReceiptUrl() + "'" +
            ", category=" + getCategory() +
            ", driver=" + getDriver() +
            "}";
    }
}
