package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ProductionSiteCriteriaTest {

    @Test
    void newProductionSiteCriteriaHasAllFiltersNullTest() {
        var productionSiteCriteria = new ProductionSiteCriteria();
        assertThat(productionSiteCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void productionSiteCriteriaFluentMethodsCreatesFiltersTest() {
        var productionSiteCriteria = new ProductionSiteCriteria();

        setAllFilters(productionSiteCriteria);

        assertThat(productionSiteCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void productionSiteCriteriaCopyCreatesNullFilterTest() {
        var productionSiteCriteria = new ProductionSiteCriteria();
        var copy = productionSiteCriteria.copy();

        assertThat(productionSiteCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(productionSiteCriteria)
        );
    }

    @Test
    void productionSiteCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var productionSiteCriteria = new ProductionSiteCriteria();
        setAllFilters(productionSiteCriteria);

        var copy = productionSiteCriteria.copy();

        assertThat(productionSiteCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(productionSiteCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var productionSiteCriteria = new ProductionSiteCriteria();

        assertThat(productionSiteCriteria).hasToString("ProductionSiteCriteria{}");
    }

    private static void setAllFilters(ProductionSiteCriteria productionSiteCriteria) {
        productionSiteCriteria.id();
        productionSiteCriteria.code();
        productionSiteCriteria.name();
        productionSiteCriteria.phone();
        productionSiteCriteria.active();
        productionSiteCriteria.tenantId();
        productionSiteCriteria.distinct();
    }

    private static Condition<ProductionSiteCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCode()) &&
                condition.apply(criteria.getName()) &&
                condition.apply(criteria.getPhone()) &&
                condition.apply(criteria.getActive()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ProductionSiteCriteria> copyFiltersAre(
        ProductionSiteCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCode(), copy.getCode()) &&
                condition.apply(criteria.getName(), copy.getName()) &&
                condition.apply(criteria.getPhone(), copy.getPhone()) &&
                condition.apply(criteria.getActive(), copy.getActive()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
