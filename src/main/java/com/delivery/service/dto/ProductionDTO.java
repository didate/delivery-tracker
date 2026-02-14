package com.delivery.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.Production} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProductionDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate productionDate;

    @NotNull
    private BigDecimal quantity;

    @Lob
    private String notes;

    @NotNull
    private TenantDTO tenant;

    @NotNull
    private ProductDTO product;

    @NotNull
    private ProductionSiteDTO productionSite;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getProductionDate() {
        return productionDate;
    }

    public void setProductionDate(LocalDate productionDate) {
        this.productionDate = productionDate;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
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

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    public ProductionSiteDTO getProductionSite() {
        return productionSite;
    }

    public void setProductionSite(ProductionSiteDTO productionSite) {
        this.productionSite = productionSite;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ProductionDTO)) {
            return false;
        }

        ProductionDTO productionDTO = (ProductionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, productionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProductionDTO{" +
            "id=" + getId() +
            ", productionDate='" + getProductionDate() + "'" +
            ", quantity=" + getQuantity() +
            ", notes='" + getNotes() + "'" +
            ", tenant=" + getTenant() +
            ", product=" + getProduct() +
            ", productionSite=" + getProductionSite() +
            "}";
    }
}
