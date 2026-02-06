package com.delivery.returns.application.dto;

import com.delivery.returns.domain.entity.ReturnReason;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateReturnItemRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Reason is required")
    private ReturnReason reason;

    @DecimalMin(value = "0.00", message = "Unit value must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Unit value must have at most 13 integer digits and 2 decimal places")
    private BigDecimal unitValue;
}
