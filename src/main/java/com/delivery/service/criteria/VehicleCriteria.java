package com.delivery.service.criteria;

import com.delivery.domain.enumeration.VehicleType;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.Vehicle} entity. This class is used
 * in {@link com.delivery.web.rest.VehicleResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /vehicles?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class VehicleCriteria implements Serializable, Criteria {

    /**
     * Class for filtering VehicleType
     */
    public static class VehicleTypeFilter extends Filter<VehicleType> {

        public VehicleTypeFilter() {}

        public VehicleTypeFilter(VehicleTypeFilter filter) {
            super(filter);
        }

        @Override
        public VehicleTypeFilter copy() {
            return new VehicleTypeFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter code;

    private StringFilter name;

    private VehicleTypeFilter type;

    private StringFilter brand;

    private StringFilter model;

    private StringFilter registrationNumber;

    private IntegerFilter year;

    private BigDecimalFilter capacity;

    private StringFilter fuelType;

    private BooleanFilter active;

    private LongFilter tenantId;

    private Boolean distinct;

    public VehicleCriteria() {}

    public VehicleCriteria(VehicleCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.code = other.optionalCode().map(StringFilter::copy).orElse(null);
        this.name = other.optionalName().map(StringFilter::copy).orElse(null);
        this.type = other.optionalType().map(VehicleTypeFilter::copy).orElse(null);
        this.brand = other.optionalBrand().map(StringFilter::copy).orElse(null);
        this.model = other.optionalModel().map(StringFilter::copy).orElse(null);
        this.registrationNumber = other.optionalRegistrationNumber().map(StringFilter::copy).orElse(null);
        this.year = other.optionalYear().map(IntegerFilter::copy).orElse(null);
        this.capacity = other.optionalCapacity().map(BigDecimalFilter::copy).orElse(null);
        this.fuelType = other.optionalFuelType().map(StringFilter::copy).orElse(null);
        this.active = other.optionalActive().map(BooleanFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public VehicleCriteria copy() {
        return new VehicleCriteria(this);
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

    public StringFilter getCode() {
        return code;
    }

    public Optional<StringFilter> optionalCode() {
        return Optional.ofNullable(code);
    }

    public StringFilter code() {
        if (code == null) {
            setCode(new StringFilter());
        }
        return code;
    }

    public void setCode(StringFilter code) {
        this.code = code;
    }

    public StringFilter getName() {
        return name;
    }

    public Optional<StringFilter> optionalName() {
        return Optional.ofNullable(name);
    }

    public StringFilter name() {
        if (name == null) {
            setName(new StringFilter());
        }
        return name;
    }

    public void setName(StringFilter name) {
        this.name = name;
    }

    public VehicleTypeFilter getType() {
        return type;
    }

    public Optional<VehicleTypeFilter> optionalType() {
        return Optional.ofNullable(type);
    }

    public VehicleTypeFilter type() {
        if (type == null) {
            setType(new VehicleTypeFilter());
        }
        return type;
    }

    public void setType(VehicleTypeFilter type) {
        this.type = type;
    }

    public StringFilter getBrand() {
        return brand;
    }

    public Optional<StringFilter> optionalBrand() {
        return Optional.ofNullable(brand);
    }

    public StringFilter brand() {
        if (brand == null) {
            setBrand(new StringFilter());
        }
        return brand;
    }

    public void setBrand(StringFilter brand) {
        this.brand = brand;
    }

    public StringFilter getModel() {
        return model;
    }

    public Optional<StringFilter> optionalModel() {
        return Optional.ofNullable(model);
    }

    public StringFilter model() {
        if (model == null) {
            setModel(new StringFilter());
        }
        return model;
    }

    public void setModel(StringFilter model) {
        this.model = model;
    }

    public StringFilter getRegistrationNumber() {
        return registrationNumber;
    }

    public Optional<StringFilter> optionalRegistrationNumber() {
        return Optional.ofNullable(registrationNumber);
    }

    public StringFilter registrationNumber() {
        if (registrationNumber == null) {
            setRegistrationNumber(new StringFilter());
        }
        return registrationNumber;
    }

    public void setRegistrationNumber(StringFilter registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public IntegerFilter getYear() {
        return year;
    }

    public Optional<IntegerFilter> optionalYear() {
        return Optional.ofNullable(year);
    }

    public IntegerFilter year() {
        if (year == null) {
            setYear(new IntegerFilter());
        }
        return year;
    }

    public void setYear(IntegerFilter year) {
        this.year = year;
    }

    public BigDecimalFilter getCapacity() {
        return capacity;
    }

    public Optional<BigDecimalFilter> optionalCapacity() {
        return Optional.ofNullable(capacity);
    }

    public BigDecimalFilter capacity() {
        if (capacity == null) {
            setCapacity(new BigDecimalFilter());
        }
        return capacity;
    }

    public void setCapacity(BigDecimalFilter capacity) {
        this.capacity = capacity;
    }

    public StringFilter getFuelType() {
        return fuelType;
    }

    public Optional<StringFilter> optionalFuelType() {
        return Optional.ofNullable(fuelType);
    }

    public StringFilter fuelType() {
        if (fuelType == null) {
            setFuelType(new StringFilter());
        }
        return fuelType;
    }

    public void setFuelType(StringFilter fuelType) {
        this.fuelType = fuelType;
    }

    public BooleanFilter getActive() {
        return active;
    }

    public Optional<BooleanFilter> optionalActive() {
        return Optional.ofNullable(active);
    }

    public BooleanFilter active() {
        if (active == null) {
            setActive(new BooleanFilter());
        }
        return active;
    }

    public void setActive(BooleanFilter active) {
        this.active = active;
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
        final VehicleCriteria that = (VehicleCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(code, that.code) &&
            Objects.equals(name, that.name) &&
            Objects.equals(type, that.type) &&
            Objects.equals(brand, that.brand) &&
            Objects.equals(model, that.model) &&
            Objects.equals(registrationNumber, that.registrationNumber) &&
            Objects.equals(year, that.year) &&
            Objects.equals(capacity, that.capacity) &&
            Objects.equals(fuelType, that.fuelType) &&
            Objects.equals(active, that.active) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, code, name, type, brand, model, registrationNumber, year, capacity, fuelType, active, tenantId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "VehicleCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCode().map(f -> "code=" + f + ", ").orElse("") +
            optionalName().map(f -> "name=" + f + ", ").orElse("") +
            optionalType().map(f -> "type=" + f + ", ").orElse("") +
            optionalBrand().map(f -> "brand=" + f + ", ").orElse("") +
            optionalModel().map(f -> "model=" + f + ", ").orElse("") +
            optionalRegistrationNumber().map(f -> "registrationNumber=" + f + ", ").orElse("") +
            optionalYear().map(f -> "year=" + f + ", ").orElse("") +
            optionalCapacity().map(f -> "capacity=" + f + ", ").orElse("") +
            optionalFuelType().map(f -> "fuelType=" + f + ", ").orElse("") +
            optionalActive().map(f -> "active=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
