package com.delivery.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.Expense} entity. This class is used
 * in {@link com.delivery.web.rest.ExpenseResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /expenses?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ExpenseCriteria implements Serializable, Criteria {

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter expenseDate;

    private BigDecimalFilter amount;

    private StringFilter receiptUrl;

    private LongFilter tenantId;

    private LongFilter categoryId;

    private LongFilter driverId;

    private Boolean distinct;

    public ExpenseCriteria() {}

    public ExpenseCriteria(ExpenseCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.expenseDate = other.optionalExpenseDate().map(LocalDateFilter::copy).orElse(null);
        this.amount = other.optionalAmount().map(BigDecimalFilter::copy).orElse(null);
        this.receiptUrl = other.optionalReceiptUrl().map(StringFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.categoryId = other.optionalCategoryId().map(LongFilter::copy).orElse(null);
        this.driverId = other.optionalDriverId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ExpenseCriteria copy() {
        return new ExpenseCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public LocalDateFilter getExpenseDate() {
        return expenseDate;
    }

    public Optional<LocalDateFilter> optionalExpenseDate() {
        return Optional.ofNullable(expenseDate);
    }

    public LocalDateFilter expenseDate() {
        if (expenseDate == null) {
            setExpenseDate(new LocalDateFilter());
        }
        return expenseDate;
    }

    public void setExpenseDate(LocalDateFilter expenseDate) {
        this.expenseDate = expenseDate;
    }

    public BigDecimalFilter getAmount() {
        return amount;
    }

    public Optional<BigDecimalFilter> optionalAmount() {
        return Optional.ofNullable(amount);
    }

    public BigDecimalFilter amount() {
        if (amount == null) {
            setAmount(new BigDecimalFilter());
        }
        return amount;
    }

    public void setAmount(BigDecimalFilter amount) {
        this.amount = amount;
    }

    public StringFilter getReceiptUrl() {
        return receiptUrl;
    }

    public Optional<StringFilter> optionalReceiptUrl() {
        return Optional.ofNullable(receiptUrl);
    }

    public StringFilter receiptUrl() {
        if (receiptUrl == null) {
            setReceiptUrl(new StringFilter());
        }
        return receiptUrl;
    }

    public void setReceiptUrl(StringFilter receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public LongFilter getTenantId() {
        return tenantId;
    }

    public Optional<LongFilter> optionalTenantId() {
        return Optional.ofNullable(tenantId);
    }

    public LongFilter tenantId() {
        if (tenantId == null) {
            setTenantId(new LongFilter());
        }
        return tenantId;
    }

    public void setTenantId(LongFilter tenantId) {
        this.tenantId = tenantId;
    }

    public LongFilter getCategoryId() {
        return categoryId;
    }

    public Optional<LongFilter> optionalCategoryId() {
        return Optional.ofNullable(categoryId);
    }

    public LongFilter categoryId() {
        if (categoryId == null) {
            setCategoryId(new LongFilter());
        }
        return categoryId;
    }

    public void setCategoryId(LongFilter categoryId) {
        this.categoryId = categoryId;
    }

    public LongFilter getDriverId() {
        return driverId;
    }

    public Optional<LongFilter> optionalDriverId() {
        return Optional.ofNullable(driverId);
    }

    public LongFilter driverId() {
        if (driverId == null) {
            setDriverId(new LongFilter());
        }
        return driverId;
    }

    public void setDriverId(LongFilter driverId) {
        this.driverId = driverId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final ExpenseCriteria that = (ExpenseCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(expenseDate, that.expenseDate) &&
            Objects.equals(amount, that.amount) &&
            Objects.equals(receiptUrl, that.receiptUrl) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(categoryId, that.categoryId) &&
            Objects.equals(driverId, that.driverId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, expenseDate, amount, receiptUrl, tenantId, categoryId, driverId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ExpenseCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalExpenseDate().map(f -> "expenseDate=" + f + ", ").orElse("") +
            optionalAmount().map(f -> "amount=" + f + ", ").orElse("") +
            optionalReceiptUrl().map(f -> "receiptUrl=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalCategoryId().map(f -> "categoryId=" + f + ", ").orElse("") +
            optionalDriverId().map(f -> "driverId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
