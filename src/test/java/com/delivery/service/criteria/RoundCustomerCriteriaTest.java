package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class RoundCustomerCriteriaTest {

    @Test
    void newRoundCustomerCriteriaHasAllFiltersNullTest() {
        var roundCustomerCriteria = new RoundCustomerCriteria();
        assertThat(roundCustomerCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void roundCustomerCriteriaFluentMethodsCreatesFiltersTest() {
        var roundCustomerCriteria = new RoundCustomerCriteria();

        setAllFilters(roundCustomerCriteria);

        assertThat(roundCustomerCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void roundCustomerCriteriaCopyCreatesNullFilterTest() {
        var roundCustomerCriteria = new RoundCustomerCriteria();
        var copy = roundCustomerCriteria.copy();

        assertThat(roundCustomerCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(roundCustomerCriteria)
        );
    }

    @Test
    void roundCustomerCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var roundCustomerCriteria = new RoundCustomerCriteria();
        setAllFilters(roundCustomerCriteria);

        var copy = roundCustomerCriteria.copy();

        assertThat(roundCustomerCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(roundCustomerCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var roundCustomerCriteria = new RoundCustomerCriteria();

        assertThat(roundCustomerCriteria).hasToString("RoundCustomerCriteria{}");
    }

    private static void setAllFilters(RoundCustomerCriteria roundCustomerCriteria) {
        roundCustomerCriteria.id();
        roundCustomerCriteria.sequenceOrder();
        roundCustomerCriteria.visited();
        roundCustomerCriteria.visitTime();
        roundCustomerCriteria.roundId();
        roundCustomerCriteria.customerId();
        roundCustomerCriteria.distinct();
    }

    private static Condition<RoundCustomerCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getSequenceOrder()) &&
                condition.apply(criteria.getVisited()) &&
                condition.apply(criteria.getVisitTime()) &&
                condition.apply(criteria.getRoundId()) &&
                condition.apply(criteria.getCustomerId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<RoundCustomerCriteria> copyFiltersAre(
        RoundCustomerCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getSequenceOrder(), copy.getSequenceOrder()) &&
                condition.apply(criteria.getVisited(), copy.getVisited()) &&
                condition.apply(criteria.getVisitTime(), copy.getVisitTime()) &&
                condition.apply(criteria.getRoundId(), copy.getRoundId()) &&
                condition.apply(criteria.getCustomerId(), copy.getCustomerId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
