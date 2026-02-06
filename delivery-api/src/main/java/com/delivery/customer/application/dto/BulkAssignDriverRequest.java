package com.delivery.customer.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkAssignDriverRequest {

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotEmpty(message = "Customer IDs list cannot be empty")
    private List<UUID> customerIds;
}
