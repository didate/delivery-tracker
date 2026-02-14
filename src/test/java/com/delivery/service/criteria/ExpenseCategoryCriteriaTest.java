package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ExpenseCategoryCriteriaTest {

    @Test
    void newExpenseCategoryCriteriaHasAllFiltersNullTest() {
        var expenseCategoryCriteria = new ExpenseCategoryCriteria();
        assertThat(expenseCategoryCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void expenseCategoryCriteriaFluentMethodsCreatesFiltersTest() {
        var expenseCategoryCriteria = new ExpenseCategoryCriteria();

        setAllFilters(expenseCategoryCriteria);

        assertThat(expenseCategoryCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void expenseCategoryCriteriaCopyCreatesNullFilterTest() {
        var expenseCategoryCriteria = new ExpenseCategoryCriteria();
        var copy = expenseCategoryCriteria.copy();

        assertThat(expenseCategoryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(expenseCategoryCriteria)
        );
    }

    @Test
    void expenseCategoryCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var expenseCategoryCriteria = new ExpenseCategoryCriteria();
        setAllFilters(expenseCategoryCriteria);

        var copy = expenseCategoryCriteria.copy();

        assertThat(expenseCategoryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(expenseCategoryCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var expenseCategoryCriteria = new ExpenseCategoryCriteria();

        assertThat(expenseCategoryCriteria).hasToString("ExpenseCategoryCriteria{}");
    }

    private static void setAllFilters(ExpenseCategoryCriteria expenseCategoryCriteria) {
        expenseCategoryCriteria.id();
        expenseCategoryCriteria.code();
        expenseCategoryCriteria.name();
        expenseCategoryCriteria.active();
        expenseCategoryCriteria.tenantId();
        expenseCategoryCriteria.distinct();
    }

    private static Condition<ExpenseCategoryCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCode()) &&
                condition.apply(criteria.getName()) &&
                condition.apply(criteria.getActive()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ExpenseCategoryCriteria> copyFiltersAre(
        ExpenseCategoryCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCode(), copy.getCode()) &&
                condition.apply(criteria.getName(), copy.getName()) &&
                condition.apply(criteria.getActive(), copy.getActive()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
