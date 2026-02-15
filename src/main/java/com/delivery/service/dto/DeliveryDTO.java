package com.delivery.service.dto;

import com.delivery.domain.enumeration.DeliveryStatus;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.Delivery} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DeliveryDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate deliveryDate;

    @NotNull
    private DeliveryStatus status;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    @Lob
    private String notes;

    @NotNull
    private CustomerDTO customer;

    @NotNull
    private DriverDTO driver;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public DriverDTO getDriver() {
        return driver;
    }

    public void setDriver(DriverDTO driver) {
        this.driver = driver;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DeliveryDTO)) {
            return false;
        }

        DeliveryDTO deliveryDTO = (DeliveryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, deliveryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DeliveryDTO{" +
            "id=" + getId() +
            ", deliveryDate='" + getDeliveryDate() + "'" +
            ", status='" + getStatus() + "'" +
            ", totalAmount=" + getTotalAmount() +
            ", paidAmount=" + getPaidAmount() +
            ", notes='" + getNotes() + "'" +
            ", customer=" + getCustomer() +
            ", driver=" + getDriver() +
            "}";
    }
}
