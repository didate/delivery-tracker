package com.delivery.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.ReturnItem} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ReturnItemDTO implements Serializable {

    private Long id;

    @NotNull
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    @NotNull
    private ProductReturnDTO productReturn;

    @NotNull
    private ProductDTO product;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public ProductReturnDTO getProductReturn() {
        return productReturn;
    }

    public void setProductReturn(ProductReturnDTO productReturn) {
        this.productReturn = productReturn;
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
        if (!(o instanceof ReturnItemDTO)) {
            return false;
        }

        ReturnItemDTO returnItemDTO = (ReturnItemDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, returnItemDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ReturnItemDTO{" +
            "id=" + getId() +
            ", quantity=" + getQuantity() +
            ", unitPrice=" + getUnitPrice() +
            ", productReturn=" + getProductReturn() +
            ", product=" + getProduct() +
            "}";
    }
}
