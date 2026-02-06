package com.delivery.delivery.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateDeliveryRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    @NotEmpty(message = "At least one delivery item is required")
    @Valid
    private List<CreateDeliveryItemRequest> items;

    private String notes;
}
