package com.delivery.service.criteria;

import com.delivery.domain.enumeration.RoundStatus;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.Round} entity. This class is used
 * in {@link com.delivery.web.rest.RoundResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /rounds?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoundCriteria implements Serializable, Criteria {

    /**
     * Class for filtering RoundStatus
     */
    public static class RoundStatusFilter extends Filter<RoundStatus> {

        public RoundStatusFilter() {}

        public RoundStatusFilter(RoundStatusFilter filter) {
            super(filter);
        }

        @Override
        public RoundStatusFilter copy() {
            return new RoundStatusFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter name;

    private LocalDateFilter roundDate;

    private RoundStatusFilter status;

    private InstantFilter startTime;

    private InstantFilter endTime;

    private LongFilter tenantId;

    private LongFilter driverId;

    private Boolean distinct;

    public RoundCriteria() {}

    public RoundCriteria(RoundCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.name = other.optionalName().map(StringFilter::copy).orElse(null);
        this.roundDate = other.optionalRoundDate().map(LocalDateFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(RoundStatusFilter::copy).orElse(null);
        this.startTime = other.optionalStartTime().map(InstantFilter::copy).orElse(null);
        this.endTime = other.optionalEndTime().map(InstantFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.driverId = other.optionalDriverId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public RoundCriteria copy() {
        return new RoundCriteria(this);
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

    public LocalDateFilter getRoundDate() {
        return roundDate;
    }

    public Optional<LocalDateFilter> optionalRoundDate() {
        return Optional.ofNullable(roundDate);
    }

    public LocalDateFilter roundDate() {
        if (roundDate == null) {
            setRoundDate(new LocalDateFilter());
        }
        return roundDate;
    }

    public void setRoundDate(LocalDateFilter roundDate) {
        this.roundDate = roundDate;
    }

    public RoundStatusFilter getStatus() {
        return status;
    }

    public Optional<RoundStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public RoundStatusFilter status() {
        if (status == null) {
            setStatus(new RoundStatusFilter());
        }
        return status;
    }

    public void setStatus(RoundStatusFilter status) {
        this.status = status;
    }

    public InstantFilter getStartTime() {
        return startTime;
    }

    public Optional<InstantFilter> optionalStartTime() {
        return Optional.ofNullable(startTime);
    }

    public InstantFilter startTime() {
        if (startTime == null) {
            setStartTime(new InstantFilter());
        }
        return startTime;
    }

    public void setStartTime(InstantFilter startTime) {
        this.startTime = startTime;
    }

    public InstantFilter getEndTime() {
        return endTime;
    }

    public Optional<InstantFilter> optionalEndTime() {
        return Optional.ofNullable(endTime);
    }

    public InstantFilter endTime() {
        if (endTime == null) {
            setEndTime(new InstantFilter());
        }
        return endTime;
    }

    public void setEndTime(InstantFilter endTime) {
        this.endTime = endTime;
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
        final RoundCriteria that = (RoundCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(name, that.name) &&
            Objects.equals(roundDate, that.roundDate) &&
            Objects.equals(status, that.status) &&
            Objects.equals(startTime, that.startTime) &&
            Objects.equals(endTime, that.endTime) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(driverId, that.driverId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, roundDate, status, startTime, endTime, tenantId, driverId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoundCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalName().map(f -> "name=" + f + ", ").orElse("") +
            optionalRoundDate().map(f -> "roundDate=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalStartTime().map(f -> "startTime=" + f + ", ").orElse("") +
            optionalEndTime().map(f -> "endTime=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalDriverId().map(f -> "driverId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
