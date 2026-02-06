package com.delivery.production.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateProductionRequest {

    @NotNull(message = "Production site ID is required")
    private UUID productionSiteId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Production date is required")
    private LocalDate productionDate;

    private String notes;
}
