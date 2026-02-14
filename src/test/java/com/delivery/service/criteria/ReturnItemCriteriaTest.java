package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ReturnItemCriteriaTest {

    @Test
    void newReturnItemCriteriaHasAllFiltersNullTest() {
        var returnItemCriteria = new ReturnItemCriteria();
        assertThat(returnItemCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void returnItemCriteriaFluentMethodsCreatesFiltersTest() {
        var returnItemCriteria = new ReturnItemCriteria();

        setAllFilters(returnItemCriteria);

        assertThat(returnItemCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void returnItemCriteriaCopyCreatesNullFilterTest() {
        var returnItemCriteria = new ReturnItemCriteria();
        var copy = returnItemCriteria.copy();

        assertThat(returnItemCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(returnItemCriteria)
        );
    }

    @Test
    void returnItemCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var returnItemCriteria = new ReturnItemCriteria();
        setAllFilters(returnItemCriteria);

        var copy = returnItemCriteria.copy();

        assertThat(returnItemCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(returnItemCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var returnItemCriteria = new ReturnItemCriteria();

        assertThat(returnItemCriteria).hasToString("ReturnItemCriteria{}");
    }

    private static void setAllFilters(ReturnItemCriteria returnItemCriteria) {
        returnItemCriteria.id();
        returnItemCriteria.quantity();
        returnItemCriteria.unitPrice();
        returnItemCriteria.productReturnId();
        returnItemCriteria.productId();
        returnItemCriteria.distinct();
    }

    private static Condition<ReturnItemCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getQuantity()) &&
                condition.apply(criteria.getUnitPrice()) &&
                condition.apply(criteria.getProductReturnId()) &&
                condition.apply(criteria.getProductId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ReturnItemCriteria> copyFiltersAre(ReturnItemCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getQuantity(), copy.getQuantity()) &&
                condition.apply(criteria.getUnitPrice(), copy.getUnitPrice()) &&
                condition.apply(criteria.getProductReturnId(), copy.getProductReturnId()) &&
                condition.apply(criteria.getProductId(), copy.getProductId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
