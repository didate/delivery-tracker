package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class DriverCriteriaTest {

    @Test
    void newDriverCriteriaHasAllFiltersNullTest() {
        var driverCriteria = new DriverCriteria();
        assertThat(driverCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void driverCriteriaFluentMethodsCreatesFiltersTest() {
        var driverCriteria = new DriverCriteria();

        setAllFilters(driverCriteria);

        assertThat(driverCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void driverCriteriaCopyCreatesNullFilterTest() {
        var driverCriteria = new DriverCriteria();
        var copy = driverCriteria.copy();

        assertThat(driverCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(driverCriteria)
        );
    }

    @Test
    void driverCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var driverCriteria = new DriverCriteria();
        setAllFilters(driverCriteria);

        var copy = driverCriteria.copy();

        assertThat(driverCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(driverCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var driverCriteria = new DriverCriteria();

        assertThat(driverCriteria).hasToString("DriverCriteria{}");
    }

    private static void setAllFilters(DriverCriteria driverCriteria) {
        driverCriteria.id();
        driverCriteria.code();
        driverCriteria.name();
        driverCriteria.phone();
        driverCriteria.email();
        driverCriteria.licenseNumber();
        driverCriteria.active();
        driverCriteria.tenantId();
        driverCriteria.vehicleId();
        driverCriteria.distinct();
    }

    private static Condition<DriverCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCode()) &&
                condition.apply(criteria.getName()) &&
                condition.apply(criteria.getPhone()) &&
                condition.apply(criteria.getEmail()) &&
                condition.apply(criteria.getLicenseNumber()) &&
                condition.apply(criteria.getActive()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getVehicleId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<DriverCriteria> copyFiltersAre(DriverCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCode(), copy.getCode()) &&
                condition.apply(criteria.getName(), copy.getName()) &&
                condition.apply(criteria.getPhone(), copy.getPhone()) &&
                condition.apply(criteria.getEmail(), copy.getEmail()) &&
                condition.apply(criteria.getLicenseNumber(), copy.getLicenseNumber()) &&
                condition.apply(criteria.getActive(), copy.getActive()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getVehicleId(), copy.getVehicleId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
