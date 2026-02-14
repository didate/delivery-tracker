package com.delivery.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.delivery.domain.TenantSettings} entity. This class is used
 * in {@link com.delivery.web.rest.TenantSettingsResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /tenant-settings?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TenantSettingsCriteria implements Serializable, Criteria {

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter currency;

    private StringFilter timezone;

    private StringFilter dateFormat;

    private StringFilter language;

    private LongFilter tenantId;

    private Boolean distinct;

    public TenantSettingsCriteria() {}

    public TenantSettingsCriteria(TenantSettingsCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.currency = other.optionalCurrency().map(StringFilter::copy).orElse(null);
        this.timezone = other.optionalTimezone().map(StringFilter::copy).orElse(null);
        this.dateFormat = other.optionalDateFormat().map(StringFilter::copy).orElse(null);
        this.language = other.optionalLanguage().map(StringFilter::copy).orElse(null);
        this.tenantId = other.optionalTenantId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public TenantSettingsCriteria copy() {
        return new TenantSettingsCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public StringFilter getCurrency() {
        return currency;
    }

    public Optional<StringFilter> optionalCurrency() {
        return Optional.ofNullable(currency);
    }

    public StringFilter currency() {
        if (currency == null) {
            setCurrency(new StringFilter());
        }
        return currency;
    }

    public void setCurrency(StringFilter currency) {
        this.currency = currency;
    }

    public StringFilter getTimezone() {
        return timezone;
    }

    public Optional<StringFilter> optionalTimezone() {
        return Optional.ofNullable(timezone);
    }

    public StringFilter timezone() {
        if (timezone == null) {
            setTimezone(new StringFilter());
        }
        return timezone;
    }

    public void setTimezone(StringFilter timezone) {
        this.timezone = timezone;
    }

    public StringFilter getDateFormat() {
        return dateFormat;
    }

    public Optional<StringFilter> optionalDateFormat() {
        return Optional.ofNullable(dateFormat);
    }

    public StringFilter dateFormat() {
        if (dateFormat == null) {
            setDateFormat(new StringFilter());
        }
        return dateFormat;
    }

    public void setDateFormat(StringFilter dateFormat) {
        this.dateFormat = dateFormat;
    }

    public StringFilter getLanguage() {
        return language;
    }

    public Optional<StringFilter> optionalLanguage() {
        return Optional.ofNullable(language);
    }

    public StringFilter language() {
        if (language == null) {
            setLanguage(new StringFilter());
        }
        return language;
    }

    public void setLanguage(StringFilter language) {
        this.language = language;
    }

    public LongFilter getTenantId() {
        return tenantId;
    }

    public Optional<LongFilter> optionalTenantId() {
        return Optional.ofNullable(tenantId);
    }

    public LongFilter tenantId() {
        if (tenantId == null) {
            setTenantId(new LongFilter());
        }
        return tenantId;
    }

    public void setTenantId(LongFilter tenantId) {
        this.tenantId = tenantId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final TenantSettingsCriteria that = (TenantSettingsCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(currency, that.currency) &&
            Objects.equals(timezone, that.timezone) &&
            Objects.equals(dateFormat, that.dateFormat) &&
            Objects.equals(language, that.language) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, currency, timezone, dateFormat, language, tenantId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TenantSettingsCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCurrency().map(f -> "currency=" + f + ", ").orElse("") +
            optionalTimezone().map(f -> "timezone=" + f + ", ").orElse("") +
            optionalDateFormat().map(f -> "dateFormat=" + f + ", ").orElse("") +
            optionalLanguage().map(f -> "language=" + f + ", ").orElse("") +
            optionalTenantId().map(f -> "tenantId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
