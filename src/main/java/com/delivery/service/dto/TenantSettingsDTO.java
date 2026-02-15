package com.delivery.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.TenantSettings} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TenantSettingsDTO implements Serializable {

    private Long id;

    @Size(max = 3)
    private String currency;

    @Size(max = 50)
    private String timezone;

    @Size(max = 20)
    private String dateFormat;

    @Size(max = 10)
    private String language;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TenantSettingsDTO)) {
            return false;
        }

        TenantSettingsDTO tenantSettingsDTO = (TenantSettingsDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, tenantSettingsDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TenantSettingsDTO{" +
            "id=" + getId() +
            ", currency='" + getCurrency() + "'" +
            ", timezone='" + getTimezone() + "'" +
            ", dateFormat='" + getDateFormat() + "'" +
            ", language='" + getLanguage() + "'" +
            "}";
    }
}
