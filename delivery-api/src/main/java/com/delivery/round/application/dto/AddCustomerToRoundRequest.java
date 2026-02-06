package com.delivery.round.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddCustomerToRoundRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    private Integer sequenceOrder;
}
