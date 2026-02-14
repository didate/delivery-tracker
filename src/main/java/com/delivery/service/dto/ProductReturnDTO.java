package com.delivery.service.dto;

import com.delivery.domain.enumeration.ReturnReason;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.ProductReturn} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProductReturnDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate returnDate;

    @NotNull
    private ReturnReason reason;

    @Lob
    private String notes;

    @NotNull
    private TenantDTO tenant;

    @NotNull
    private CustomerDTO customer;

    private DeliveryDTO delivery;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public ReturnReason getReason() {
        return reason;
    }

    public void setReason(ReturnReason reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public TenantDTO getTenant() {
        return tenant;
    }

    public void setTenant(TenantDTO tenant) {
        this.tenant = tenant;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public DeliveryDTO getDelivery() {
        return delivery;
    }

    public void setDelivery(DeliveryDTO delivery) {
        this.delivery = delivery;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ProductReturnDTO)) {
            return false;
        }

        ProductReturnDTO productReturnDTO = (ProductReturnDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, productReturnDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProductReturnDTO{" +
            "id=" + getId() +
            ", returnDate='" + getReturnDate() + "'" +
            ", reason='" + getReason() + "'" +
            ", notes='" + getNotes() + "'" +
            ", tenant=" + getTenant() +
            ", customer=" + getCustomer() +
            ", delivery=" + getDelivery() +
            "}";
    }
}
