package com.delivery.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.RoundCustomer} entity. This class is used
 * in {@link com.delivery.web.rest.RoundCustomerResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /round-customers?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoundCustomerCriteria implements Serializable, Criteria {

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private IntegerFilter sequenceOrder;

    private BooleanFilter visited;

    private InstantFilter visitTime;

    private LongFilter roundId;

    private LongFilter customerId;

    private Boolean distinct;

    public RoundCustomerCriteria() {}

    public RoundCustomerCriteria(RoundCustomerCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.sequenceOrder = other.optionalSequenceOrder().map(IntegerFilter::copy).orElse(null);
        this.visited = other.optionalVisited().map(BooleanFilter::copy).orElse(null);
        this.visitTime = other.optionalVisitTime().map(InstantFilter::copy).orElse(null);
        this.roundId = other.optionalRoundId().map(LongFilter::copy).orElse(null);
        this.customerId = other.optionalCustomerId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public RoundCustomerCriteria copy() {
        return new RoundCustomerCriteria(this);
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

    public IntegerFilter getSequenceOrder() {
        return sequenceOrder;
    }

    public Optional<IntegerFilter> optionalSequenceOrder() {
        return Optional.ofNullable(sequenceOrder);
    }

    public IntegerFilter sequenceOrder() {
        if (sequenceOrder == null) {
            setSequenceOrder(new IntegerFilter());
        }
        return sequenceOrder;
    }

    public void setSequenceOrder(IntegerFilter sequenceOrder) {
        this.sequenceOrder = sequenceOrder;
    }

    public BooleanFilter getVisited() {
        return visited;
    }

    public Optional<BooleanFilter> optionalVisited() {
        return Optional.ofNullable(visited);
    }

    public BooleanFilter visited() {
        if (visited == null) {
            setVisited(new BooleanFilter());
        }
        return visited;
    }

    public void setVisited(BooleanFilter visited) {
        this.visited = visited;
    }

    public InstantFilter getVisitTime() {
        return visitTime;
    }

    public Optional<InstantFilter> optionalVisitTime() {
        return Optional.ofNullable(visitTime);
    }

    public InstantFilter visitTime() {
        if (visitTime == null) {
            setVisitTime(new InstantFilter());
        }
        return visitTime;
    }

    public void setVisitTime(InstantFilter visitTime) {
        this.visitTime = visitTime;
    }

    public LongFilter getRoundId() {
        return roundId;
    }

    public Optional<LongFilter> optionalRoundId() {
        return Optional.ofNullable(roundId);
    }

    public LongFilter roundId() {
        if (roundId == null) {
            setRoundId(new LongFilter());
        }
        return roundId;
    }

    public void setRoundId(LongFilter roundId) {
        this.roundId = roundId;
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
        final RoundCustomerCriteria that = (RoundCustomerCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(sequenceOrder, that.sequenceOrder) &&
            Objects.equals(visited, that.visited) &&
            Objects.equals(visitTime, that.visitTime) &&
            Objects.equals(roundId, that.roundId) &&
            Objects.equals(customerId, that.customerId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, sequenceOrder, visited, visitTime, roundId, customerId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoundCustomerCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalSequenceOrder().map(f -> "sequenceOrder=" + f + ", ").orElse("") +
            optionalVisited().map(f -> "visited=" + f + ", ").orElse("") +
            optionalVisitTime().map(f -> "visitTime=" + f + ", ").orElse("") +
            optionalRoundId().map(f -> "roundId=" + f + ", ").orElse("") +
            optionalCustomerId().map(f -> "customerId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
