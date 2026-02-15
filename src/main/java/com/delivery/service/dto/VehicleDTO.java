package com.delivery.service.dto;

import com.delivery.domain.enumeration.VehicleType;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.Vehicle} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class VehicleDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 20)
    private String code;

    @NotNull
    @Size(max = 100)
    private String name;

    @NotNull
    private VehicleType type;

    @Size(max = 50)
    private String brand;

    @Size(max = 50)
    private String model;

    @Size(max = 20)
    private String registrationNumber;

    private Integer year;

    private BigDecimal capacity;

    @Size(max = 20)
    private String fuelType;

    @NotNull
    private Boolean active;

    @Lob
    private String notes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VehicleType getType() {
        return type;
    }

    public void setType(VehicleType type) {
        this.type = type;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getCapacity() {
        return capacity;
    }

    public void setCapacity(BigDecimal capacity) {
        this.capacity = capacity;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof VehicleDTO)) {
            return false;
        }

        VehicleDTO vehicleDTO = (VehicleDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, vehicleDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "VehicleDTO{" +
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
