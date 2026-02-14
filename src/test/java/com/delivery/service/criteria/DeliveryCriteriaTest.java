package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class DeliveryCriteriaTest {

    @Test
    void newDeliveryCriteriaHasAllFiltersNullTest() {
        var deliveryCriteria = new DeliveryCriteria();
        assertThat(deliveryCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void deliveryCriteriaFluentMethodsCreatesFiltersTest() {
        var deliveryCriteria = new DeliveryCriteria();

        setAllFilters(deliveryCriteria);

        assertThat(deliveryCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void deliveryCriteriaCopyCreatesNullFilterTest() {
        var deliveryCriteria = new DeliveryCriteria();
        var copy = deliveryCriteria.copy();

        assertThat(deliveryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(deliveryCriteria)
        );
    }

    @Test
    void deliveryCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var deliveryCriteria = new DeliveryCriteria();
        setAllFilters(deliveryCriteria);

        var copy = deliveryCriteria.copy();

        assertThat(deliveryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(deliveryCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var deliveryCriteria = new DeliveryCriteria();

        assertThat(deliveryCriteria).hasToString("DeliveryCriteria{}");
    }

    private static void setAllFilters(DeliveryCriteria deliveryCriteria) {
        deliveryCriteria.id();
        deliveryCriteria.deliveryDate();
        deliveryCriteria.status();
        deliveryCriteria.totalAmount();
        deliveryCriteria.paidAmount();
        deliveryCriteria.tenantId();
        deliveryCriteria.customerId();
        deliveryCriteria.driverId();
        deliveryCriteria.distinct();
    }

    private static Condition<DeliveryCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getDeliveryDate()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getTotalAmount()) &&
                condition.apply(criteria.getPaidAmount()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getCustomerId()) &&
                condition.apply(criteria.getDriverId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<DeliveryCriteria> copyFiltersAre(DeliveryCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getDeliveryDate(), copy.getDeliveryDate()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getTotalAmount(), copy.getTotalAmount()) &&
                condition.apply(criteria.getPaidAmount(), copy.getPaidAmount()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getCustomerId(), copy.getCustomerId()) &&
                condition.apply(criteria.getDriverId(), copy.getDriverId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
