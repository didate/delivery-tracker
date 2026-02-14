package com.delivery.service.criteria;

import com.delivery.domain.enumeration.ReturnReason;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.ProductReturn} entity. This class is used
 * in {@link com.delivery.web.rest.ProductReturnResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /product-returns?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProductReturnCriteria implements Serializable, Criteria {

    /**
     * Class for filtering ReturnReason
     */
    public static class ReturnReasonFilter extends Filter<ReturnReason> {

        public ReturnReasonFilter() {}

        public ReturnReasonFilter(ReturnReasonFilter filter) {
            super(filter);
        }

        @Override
        public ReturnReasonFilter copy() {
            return new ReturnReasonFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter returnDate;

    private ReturnReasonFilter reason;

    private LongFilter tenantId;

    private LongFilter customerId;

    private LongFilter deliveryId;

    private Boolean distinct;

    public ProductReturnCriteria() {}

    public ProductReturnCriteria(ProductReturnCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.returnDate = other.optionalReturnDate().map(LocalDateFilter::copy).orElse(null);
        this.reason = other.optionalReason().map(ReturnReasonFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.customerId = other.optionalCustomerId().map(LongFilter::copy).orElse(null);
        this.deliveryId = other.optionalDeliveryId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ProductReturnCriteria copy() {
        return new ProductReturnCriteria(this);
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

    public LocalDateFilter getReturnDate() {
        return returnDate;
    }

    public Optional<LocalDateFilter> optionalReturnDate() {
        return Optional.ofNullable(returnDate);
    }

    public LocalDateFilter returnDate() {
        if (returnDate == null) {
            setReturnDate(new LocalDateFilter());
        }
        return returnDate;
    }

    public void setReturnDate(LocalDateFilter returnDate) {
        this.returnDate = returnDate;
    }

    public ReturnReasonFilter getReason() {
        return reason;
    }

    public Optional<ReturnReasonFilter> optionalReason() {
        return Optional.ofNullable(reason);
    }

    public ReturnReasonFilter reason() {
        if (reason == null) {
            setReason(new ReturnReasonFilter());
        }
        return reason;
    }

    public void setReason(ReturnReasonFilter reason) {
        this.reason = reason;
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

    public LongFilter getCustomerId() {
        return customerId;
    }

    public Optional<LongFilter> optionalCustomerId() {
        return Optional.ofNullable(customerId);
    }

    public LongFilter customerId() {
        if (customerId == null) {
            setCustomerId(new LongFilter());
        }
        return customerId;
    }

    public void setCustomerId(LongFilter customerId) {
        this.customerId = customerId;
    }

    public LongFilter getDeliveryId() {
        return deliveryId;
    }

    public Optional<LongFilter> optionalDeliveryId() {
        return Optional.ofNullable(deliveryId);
    }

    public LongFilter deliveryId() {
        if (deliveryId == null) {
            setDeliveryId(new LongFilter());
        }
        return deliveryId;
    }

    public void setDeliveryId(LongFilter deliveryId) {
        this.deliveryId = deliveryId;
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
        final ProductReturnCriteria that = (ProductReturnCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(returnDate, that.returnDate) &&
            Objects.equals(reason, that.reason) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(customerId, that.customerId) &&
            Objects.equals(deliveryId, that.deliveryId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, returnDate, reason, tenantId, customerId, deliveryId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProductReturnCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalReturnDate().map(f -> "returnDate=" + f + ", ").orElse("") +
            optionalReason().map(f -> "reason=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalCustomerId().map(f -> "customerId=" + f + ", ").orElse("") +
            optionalDeliveryId().map(f -> "deliveryId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
