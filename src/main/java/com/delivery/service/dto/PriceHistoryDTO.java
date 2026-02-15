package com.delivery.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.PriceHistory} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PriceHistoryDTO implements Serializable {

    private Long id;

    @NotNull
    private BigDecimal price;

    @NotNull
    private LocalDate effectiveDate;

    private LocalDate endDate;

    @NotNull
    private ProductDTO product;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PriceHistoryDTO)) {
            return false;
        }

        PriceHistoryDTO priceHistoryDTO = (PriceHistoryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, priceHistoryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PriceHistoryDTO{" +
            "id=" + getId() +
            ", price=" + getPrice() +
            ", effectiveDate='" + getEffectiveDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", product=" + getProduct() +
            "}";
    }
}
