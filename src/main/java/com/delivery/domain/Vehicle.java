package com.delivery.domain;

import com.delivery.domain.enumeration.VehicleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Vehicle.
 */
@Entity
@Table(name = "vehicle")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Vehicle implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "code", length = 20, nullable = false)
    private String code;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private VehicleType type;

    @Size(max = 50)
    @Column(name = "brand", length = 50)
    private String brand;

    @Size(max = 50)
    @Column(name = "model", length = 50)
    private String model;

    @Size(max = 20)
    @Column(name = "registration_number", length = 20)
    private String registrationNumber;

    @Column(name = "year")
    private Integer year;

    @Column(name = "capacity", precision = 21, scale = 2)
    private BigDecimal capacity;

    @Size(max = 20)
    @Column(name = "fuel_type", length = 20)
    private String fuelType;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @Lob
    @Column(name = "notes")
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    private Tenant tenant;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Vehicle id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public Vehicle code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return this.name;
    }

    public Vehicle name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VehicleType getType() {
        return this.type;
    }

    public Vehicle type(VehicleType type) {
        this.setType(type);
        return this;
    }

    public void setType(VehicleType type) {
        this.type = type;
    }

    public String getBrand() {
        return this.brand;
    }

    public Vehicle brand(String brand) {
        this.setBrand(brand);
        return this;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return this.model;
    }

    public Vehicle model(String model) {
        this.setModel(model);
        return this;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getRegistrationNumber() {
        return this.registrationNumber;
    }

    public Vehicle registrationNumber(String registrationNumber) {
        this.setRegistrationNumber(registrationNumber);
        return this;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public Integer getYear() {
        return this.year;
    }

    public Vehicle year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getCapacity() {
        return this.capacity;
    }

    public Vehicle capacity(BigDecimal capacity) {
        this.setCapacity(capacity);
        return this;
    }

    public void setCapacity(BigDecimal capacity) {
        this.capacity = capacity;
    }

    public String getFuelType() {
        return this.fuelType;
    }

    public Vehicle fuelType(String fuelType) {
        this.setFuelType(fuelType);
        return this;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Boolean getActive() {
        return this.active;
    }

    public Vehicle active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getNotes() {
        return this.notes;
    }

    public Vehicle notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Tenant getTenant() {
        return this.tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public Vehicle tenant(Tenant tenant) {
        this.setTenant(tenant);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Vehicle)) {
            return false;
        }
        return getId() != null && getId().equals(((Vehicle) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Vehicle{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", brand='" + getBrand() + "'" +
            ", model='" + getModel() + "'" +
            ", registrationNumber='" + getRegistrationNumber() + "'" +
            ", year=" + getYear() +
            ", capacity=" + getCapacity() +
            ", fuelType='" + getFuelType() + "'" +
            ", active='" + getActive() + "'" +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
