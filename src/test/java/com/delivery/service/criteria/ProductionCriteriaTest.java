package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ProductionCriteriaTest {

    @Test
    void newProductionCriteriaHasAllFiltersNullTest() {
        var productionCriteria = new ProductionCriteria();
        assertThat(productionCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void productionCriteriaFluentMethodsCreatesFiltersTest() {
        var productionCriteria = new ProductionCriteria();

        setAllFilters(productionCriteria);

        assertThat(productionCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void productionCriteriaCopyCreatesNullFilterTest() {
        var productionCriteria = new ProductionCriteria();
        var copy = productionCriteria.copy();

        assertThat(productionCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(productionCriteria)
        );
    }

    @Test
    void productionCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var productionCriteria = new ProductionCriteria();
        setAllFilters(productionCriteria);

        var copy = productionCriteria.copy();

        assertThat(productionCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(productionCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var productionCriteria = new ProductionCriteria();

        assertThat(productionCriteria).hasToString("ProductionCriteria{}");
    }

    private static void setAllFilters(ProductionCriteria productionCriteria) {
        productionCriteria.id();
        productionCriteria.productionDate();
        productionCriteria.quantity();
        productionCriteria.tenantId();
        productionCriteria.productId();
        productionCriteria.productionSiteId();
        productionCriteria.distinct();
    }

    private static Condition<ProductionCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getProductionDate()) &&
                condition.apply(criteria.getQuantity()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getProductId()) &&
                condition.apply(criteria.getProductionSiteId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ProductionCriteria> copyFiltersAre(ProductionCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getProductionDate(), copy.getProductionDate()) &&
                condition.apply(criteria.getQuantity(), copy.getQuantity()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getProductId(), copy.getProductId()) &&
                condition.apply(criteria.getProductionSiteId(), copy.getProductionSiteId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
