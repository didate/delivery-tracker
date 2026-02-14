package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class RoundCriteriaTest {

    @Test
    void newRoundCriteriaHasAllFiltersNullTest() {
        var roundCriteria = new RoundCriteria();
        assertThat(roundCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void roundCriteriaFluentMethodsCreatesFiltersTest() {
        var roundCriteria = new RoundCriteria();

        setAllFilters(roundCriteria);

        assertThat(roundCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void roundCriteriaCopyCreatesNullFilterTest() {
        var roundCriteria = new RoundCriteria();
        var copy = roundCriteria.copy();

        assertThat(roundCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(roundCriteria)
        );
    }

    @Test
    void roundCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var roundCriteria = new RoundCriteria();
        setAllFilters(roundCriteria);

        var copy = roundCriteria.copy();

        assertThat(roundCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(roundCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var roundCriteria = new RoundCriteria();

        assertThat(roundCriteria).hasToString("RoundCriteria{}");
    }

    private static void setAllFilters(RoundCriteria roundCriteria) {
        roundCriteria.id();
        roundCriteria.name();
        roundCriteria.roundDate();
        roundCriteria.status();
        roundCriteria.startTime();
        roundCriteria.endTime();
        roundCriteria.tenantId();
        roundCriteria.driverId();
        roundCriteria.distinct();
    }

    private static Condition<RoundCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getName()) &&
                condition.apply(criteria.getRoundDate()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getStartTime()) &&
                condition.apply(criteria.getEndTime()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getDriverId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<RoundCriteria> copyFiltersAre(RoundCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getName(), copy.getName()) &&
                condition.apply(criteria.getRoundDate(), copy.getRoundDate()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getStartTime(), copy.getStartTime()) &&
                condition.apply(criteria.getEndTime(), copy.getEndTime()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getDriverId(), copy.getDriverId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
