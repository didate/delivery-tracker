package com.delivery.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A TenantSettings.
 */
@Entity
@Table(name = "tenant_settings")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TenantSettings implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Size(max = 3)
    @Column(name = "currency", length = 3)
    private String currency;

    @Size(max = 50)
    @Column(name = "timezone", length = 50)
    private String timezone;

    @Size(max = 20)
    @Column(name = "date_format", length = 20)
    private String dateFormat;

    @Size(max = 10)
    @Column(name = "language", length = 10)
    private String language;

    @ManyToOne(optional = false)
    @NotNull
    private Tenant tenant;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TenantSettings id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCurrency() {
        return this.currency;
    }

    public TenantSettings currency(String currency) {
        this.setCurrency(currency);
        return this;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimezone() {
        return this.timezone;
    }

    public TenantSettings timezone(String timezone) {
        this.setTimezone(timezone);
        return this;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getDateFormat() {
        return this.dateFormat;
    }

    public TenantSettings dateFormat(String dateFormat) {
        this.setDateFormat(dateFormat);
        return this;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getLanguage() {
        return this.language;
    }

    public TenantSettings language(String language) {
        this.setLanguage(language);
        return this;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Tenant getTenant() {
        return this.tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public TenantSettings tenant(Tenant tenant) {
        this.setTenant(tenant);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TenantSettings)) {
            return false;
        }
        return getId() != null && getId().equals(((TenantSettings) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TenantSettings{" +
            "id=" + getId() +
            ", currency='" + getCurrency() + "'" +
            ", timezone='" + getTimezone() + "'" +
            ", dateFormat='" + getDateFormat() + "'" +
            ", language='" + getLanguage() + "'" +
            "}";
    }
}
