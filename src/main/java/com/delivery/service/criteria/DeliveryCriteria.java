package com.delivery.service.criteria;

import com.delivery.domain.enumeration.DeliveryStatus;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.Delivery} entity. This class is used
 * in {@link com.delivery.web.rest.DeliveryResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /deliveries?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DeliveryCriteria implements Serializable, Criteria {

    /**
     * Class for filtering DeliveryStatus
     */
    public static class DeliveryStatusFilter extends Filter<DeliveryStatus> {

        public DeliveryStatusFilter() {}

        public DeliveryStatusFilter(DeliveryStatusFilter filter) {
            super(filter);
        }

        @Override
        public DeliveryStatusFilter copy() {
            return new DeliveryStatusFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter deliveryDate;

    private DeliveryStatusFilter status;

    private BigDecimalFilter totalAmount;

    private BigDecimalFilter paidAmount;

    private LongFilter tenantId;

    private LongFilter customerId;

    private LongFilter driverId;

    private Boolean distinct;

    public DeliveryCriteria() {}

    public DeliveryCriteria(DeliveryCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.deliveryDate = other.optionalDeliveryDate().map(LocalDateFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(DeliveryStatusFilter::copy).orElse(null);
        this.totalAmount = other.optionalTotalAmount().map(BigDecimalFilter::copy).orElse(null);
        this.paidAmount = other.optionalPaidAmount().map(BigDecimalFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.customerId = other.optionalCustomerId().map(LongFilter::copy).orElse(null);
        this.driverId = other.optionalDriverId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public DeliveryCriteria copy() {
        return new DeliveryCriteria(this);
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

    public LocalDateFilter getDeliveryDate() {
        return deliveryDate;
    }

    public Optional<LocalDateFilter> optionalDeliveryDate() {
        return Optional.ofNullable(deliveryDate);
    }

    public LocalDateFilter deliveryDate() {
        if (deliveryDate == null) {
            setDeliveryDate(new LocalDateFilter());
        }
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateFilter deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public DeliveryStatusFilter getStatus() {
        return status;
    }

    public Optional<DeliveryStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public DeliveryStatusFilter status() {
        if (status == null) {
            setStatus(new DeliveryStatusFilter());
        }
        return status;
    }

    public void setStatus(DeliveryStatusFilter status) {
        this.status = status;
    }

    public BigDecimalFilter getTotalAmount() {
        return totalAmount;
    }

    public Optional<BigDecimalFilter> optionalTotalAmount() {
        return Optional.ofNullable(totalAmount);
    }

    public BigDecimalFilter totalAmount() {
        if (totalAmount == null) {
            setTotalAmount(new BigDecimalFilter());
        }
        return totalAmount;
    }

    public void setTotalAmount(BigDecimalFilter totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimalFilter getPaidAmount() {
        return paidAmount;
    }

    public Optional<BigDecimalFilter> optionalPaidAmount() {
        return Optional.ofNullable(paidAmount);
    }

    public BigDecimalFilter paidAmount() {
        if (paidAmount == null) {
            setPaidAmount(new BigDecimalFilter());
        }
        return paidAmount;
    }

    public void setPaidAmount(BigDecimalFilter paidAmount) {
        this.paidAmount = paidAmount;
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
        final DeliveryCriteria that = (DeliveryCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(deliveryDate, that.deliveryDate) &&
            Objects.equals(status, that.status) &&
            Objects.equals(totalAmount, that.totalAmount) &&
            Objects.equals(paidAmount, that.paidAmount) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(customerId, that.customerId) &&
            Objects.equals(driverId, that.driverId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, deliveryDate, status, totalAmount, paidAmount, tenantId, customerId, driverId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DeliveryCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalDeliveryDate().map(f -> "deliveryDate=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalTotalAmount().map(f -> "totalAmount=" + f + ", ").orElse("") +
            optionalPaidAmount().map(f -> "paidAmount=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalCustomerId().map(f -> "customerId=" + f + ", ").orElse("") +
            optionalDriverId().map(f -> "driverId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
