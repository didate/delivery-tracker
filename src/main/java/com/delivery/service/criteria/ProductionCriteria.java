package com.delivery.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.Production} entity. This class is used
 * in {@link com.delivery.web.rest.ProductionResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /productions?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProductionCriteria implements Serializable, Criteria {

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter productionDate;

    private BigDecimalFilter quantity;

    private LongFilter tenantId;

    private LongFilter productId;

    private LongFilter productionSiteId;

    private Boolean distinct;

    public ProductionCriteria() {}

    public ProductionCriteria(ProductionCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.productionDate = other.optionalProductionDate().map(LocalDateFilter::copy).orElse(null);
        this.quantity = other.optionalQuantity().map(BigDecimalFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.productId = other.optionalProductId().map(LongFilter::copy).orElse(null);
        this.productionSiteId = other.optionalProductionSiteId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ProductionCriteria copy() {
        return new ProductionCriteria(this);
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

    public LocalDateFilter getProductionDate() {
        return productionDate;
    }

    public Optional<LocalDateFilter> optionalProductionDate() {
        return Optional.ofNullable(productionDate);
    }

    public LocalDateFilter productionDate() {
        if (productionDate == null) {
            setProductionDate(new LocalDateFilter());
        }
        return productionDate;
    }

    public void setProductionDate(LocalDateFilter productionDate) {
        this.productionDate = productionDate;
    }

    public BigDecimalFilter getQuantity() {
        return quantity;
    }

    public Optional<BigDecimalFilter> optionalQuantity() {
        return Optional.ofNullable(quantity);
    }

    public BigDecimalFilter quantity() {
        if (quantity == null) {
            setQuantity(new BigDecimalFilter());
        }
        return quantity;
    }

    public void setQuantity(BigDecimalFilter quantity) {
        this.quantity = quantity;
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

    public LongFilter getProductId() {
        return productId;
    }

    public Optional<LongFilter> optionalProductId() {
        return Optional.ofNullable(productId);
    }

    public LongFilter productId() {
        if (productId == null) {
            setProductId(new LongFilter());
        }
        return productId;
    }

    public void setProductId(LongFilter productId) {
        this.productId = productId;
    }

    public LongFilter getProductionSiteId() {
        return productionSiteId;
    }

    public Optional<LongFilter> optionalProductionSiteId() {
        return Optional.ofNullable(productionSiteId);
    }

    public LongFilter productionSiteId() {
        if (productionSiteId == null) {
            setProductionSiteId(new LongFilter());
        }
        return productionSiteId;
    }

    public void setProductionSiteId(LongFilter productionSiteId) {
        this.productionSiteId = productionSiteId;
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
        final ProductionCriteria that = (ProductionCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(productionDate, that.productionDate) &&
            Objects.equals(quantity, that.quantity) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(productId, that.productId) &&
            Objects.equals(productionSiteId, that.productionSiteId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, productionDate, quantity, tenantId, productId, productionSiteId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProductionCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalProductionDate().map(f -> "productionDate=" + f + ", ").orElse("") +
            optionalQuantity().map(f -> "quantity=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalProductId().map(f -> "productId=" + f + ", ").orElse("") +
            optionalProductionSiteId().map(f -> "productionSiteId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
