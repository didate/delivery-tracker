package com.delivery.production.application.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateProductionRequest {

    private UUID productionSiteId;

    private UUID productId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private LocalDate productionDate;

    private String notes;
}
