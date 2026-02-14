package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class DeliveryItemCriteriaTest {

    @Test
    void newDeliveryItemCriteriaHasAllFiltersNullTest() {
        var deliveryItemCriteria = new DeliveryItemCriteria();
        assertThat(deliveryItemCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void deliveryItemCriteriaFluentMethodsCreatesFiltersTest() {
        var deliveryItemCriteria = new DeliveryItemCriteria();

        setAllFilters(deliveryItemCriteria);

        assertThat(deliveryItemCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void deliveryItemCriteriaCopyCreatesNullFilterTest() {
        var deliveryItemCriteria = new DeliveryItemCriteria();
        var copy = deliveryItemCriteria.copy();

        assertThat(deliveryItemCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(deliveryItemCriteria)
        );
    }

    @Test
    void deliveryItemCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var deliveryItemCriteria = new DeliveryItemCriteria();
        setAllFilters(deliveryItemCriteria);

        var copy = deliveryItemCriteria.copy();

        assertThat(deliveryItemCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(deliveryItemCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var deliveryItemCriteria = new DeliveryItemCriteria();

        assertThat(deliveryItemCriteria).hasToString("DeliveryItemCriteria{}");
    }

    private static void setAllFilters(DeliveryItemCriteria deliveryItemCriteria) {
        deliveryItemCriteria.id();
        deliveryItemCriteria.quantity();
        deliveryItemCriteria.unitPrice();
        deliveryItemCriteria.totalPrice();
        deliveryItemCriteria.deliveryId();
        deliveryItemCriteria.productId();
        deliveryItemCriteria.distinct();
    }

    private static Condition<DeliveryItemCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getQuantity()) &&
                condition.apply(criteria.getUnitPrice()) &&
                condition.apply(criteria.getTotalPrice()) &&
                condition.apply(criteria.getDeliveryId()) &&
                condition.apply(criteria.getProductId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<DeliveryItemCriteria> copyFiltersAre(
        DeliveryItemCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getQuantity(), copy.getQuantity()) &&
                condition.apply(criteria.getUnitPrice(), copy.getUnitPrice()) &&
                condition.apply(criteria.getTotalPrice(), copy.getTotalPrice()) &&
                condition.apply(criteria.getDeliveryId(), copy.getDeliveryId()) &&
                condition.apply(criteria.getProductId(), copy.getProductId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
