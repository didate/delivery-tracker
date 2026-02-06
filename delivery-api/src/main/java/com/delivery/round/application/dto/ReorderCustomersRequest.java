package com.delivery.round.application.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReorderCustomersRequest {

    @NotEmpty(message = "Customer IDs list cannot be empty")
    private List<UUID> customerIds;
}
