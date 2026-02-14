package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class PriceHistoryCriteriaTest {

    @Test
    void newPriceHistoryCriteriaHasAllFiltersNullTest() {
        var priceHistoryCriteria = new PriceHistoryCriteria();
        assertThat(priceHistoryCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void priceHistoryCriteriaFluentMethodsCreatesFiltersTest() {
        var priceHistoryCriteria = new PriceHistoryCriteria();

        setAllFilters(priceHistoryCriteria);

        assertThat(priceHistoryCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void priceHistoryCriteriaCopyCreatesNullFilterTest() {
        var priceHistoryCriteria = new PriceHistoryCriteria();
        var copy = priceHistoryCriteria.copy();

        assertThat(priceHistoryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(priceHistoryCriteria)
        );
    }

    @Test
    void priceHistoryCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var priceHistoryCriteria = new PriceHistoryCriteria();
        setAllFilters(priceHistoryCriteria);

        var copy = priceHistoryCriteria.copy();

        assertThat(priceHistoryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(priceHistoryCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var priceHistoryCriteria = new PriceHistoryCriteria();

        assertThat(priceHistoryCriteria).hasToString("PriceHistoryCriteria{}");
    }

    private static void setAllFilters(PriceHistoryCriteria priceHistoryCriteria) {
        priceHistoryCriteria.id();
        priceHistoryCriteria.price();
        priceHistoryCriteria.effectiveDate();
        priceHistoryCriteria.productId();
        priceHistoryCriteria.distinct();
    }

    private static Condition<PriceHistoryCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getPrice()) &&
                condition.apply(criteria.getEffectiveDate()) &&
                condition.apply(criteria.getProductId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<PriceHistoryCriteria> copyFiltersAre(
        PriceHistoryCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getPrice(), copy.getPrice()) &&
                condition.apply(criteria.getEffectiveDate(), copy.getEffectiveDate()) &&
                condition.apply(criteria.getProductId(), copy.getProductId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
