package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ProductReturnCriteriaTest {

    @Test
    void newProductReturnCriteriaHasAllFiltersNullTest() {
        var productReturnCriteria = new ProductReturnCriteria();
        assertThat(productReturnCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void productReturnCriteriaFluentMethodsCreatesFiltersTest() {
        var productReturnCriteria = new ProductReturnCriteria();

        setAllFilters(productReturnCriteria);

        assertThat(productReturnCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void productReturnCriteriaCopyCreatesNullFilterTest() {
        var productReturnCriteria = new ProductReturnCriteria();
        var copy = productReturnCriteria.copy();

        assertThat(productReturnCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(productReturnCriteria)
        );
    }

    @Test
    void productReturnCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var productReturnCriteria = new ProductReturnCriteria();
        setAllFilters(productReturnCriteria);

        var copy = productReturnCriteria.copy();

        assertThat(productReturnCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(productReturnCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var productReturnCriteria = new ProductReturnCriteria();

        assertThat(productReturnCriteria).hasToString("ProductReturnCriteria{}");
    }

    private static void setAllFilters(ProductReturnCriteria productReturnCriteria) {
        productReturnCriteria.id();
        productReturnCriteria.returnDate();
        productReturnCriteria.reason();
        productReturnCriteria.tenantId();
        productReturnCriteria.customerId();
        productReturnCriteria.deliveryId();
        productReturnCriteria.distinct();
    }

    private static Condition<ProductReturnCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getReturnDate()) &&
                condition.apply(criteria.getReason()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getCustomerId()) &&
                condition.apply(criteria.getDeliveryId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ProductReturnCriteria> copyFiltersAre(
        ProductReturnCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getReturnDate(), copy.getReturnDate()) &&
                condition.apply(criteria.getReason(), copy.getReason()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getCustomerId(), copy.getCustomerId()) &&
                condition.apply(criteria.getDeliveryId(), copy.getDeliveryId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
