package com.delivery.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class TenantSettingsCriteriaTest {

    @Test
    void newTenantSettingsCriteriaHasAllFiltersNullTest() {
        var tenantSettingsCriteria = new TenantSettingsCriteria();
        assertThat(tenantSettingsCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void tenantSettingsCriteriaFluentMethodsCreatesFiltersTest() {
        var tenantSettingsCriteria = new TenantSettingsCriteria();

        setAllFilters(tenantSettingsCriteria);

        assertThat(tenantSettingsCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void tenantSettingsCriteriaCopyCreatesNullFilterTest() {
        var tenantSettingsCriteria = new TenantSettingsCriteria();
        var copy = tenantSettingsCriteria.copy();

        assertThat(tenantSettingsCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(tenantSettingsCriteria)
        );
    }

    @Test
    void tenantSettingsCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var tenantSettingsCriteria = new TenantSettingsCriteria();
        setAllFilters(tenantSettingsCriteria);

        var copy = tenantSettingsCriteria.copy();

        assertThat(tenantSettingsCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(tenantSettingsCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var tenantSettingsCriteria = new TenantSettingsCriteria();

        assertThat(tenantSettingsCriteria).hasToString("TenantSettingsCriteria{}");
    }

    private static void setAllFilters(TenantSettingsCriteria tenantSettingsCriteria) {
        tenantSettingsCriteria.id();
        tenantSettingsCriteria.currency();
        tenantSettingsCriteria.timezone();
        tenantSettingsCriteria.dateFormat();
        tenantSettingsCriteria.language();
        tenantSettingsCriteria.tenantId();
        tenantSettingsCriteria.distinct();
    }

    private static Condition<TenantSettingsCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCurrency()) &&
                condition.apply(criteria.getTimezone()) &&
                condition.apply(criteria.getDateFormat()) &&
                condition.apply(criteria.getLanguage()) &&
                condition.apply(criteria.getTenantId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<TenantSettingsCriteria> copyFiltersAre(
        TenantSettingsCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCurrency(), copy.getCurrency()) &&
                condition.apply(criteria.getTimezone(), copy.getTimezone()) &&
                condition.apply(criteria.getDateFormat(), copy.getDateFormat()) &&
                condition.apply(criteria.getLanguage(), copy.getLanguage()) &&
                condition.apply(criteria.getTenantId(), copy.getTenantId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
