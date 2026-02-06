package com.delivery.round.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateRoundRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Round date is required")
    private LocalDate roundDate;

    private List<UUID> customerIds;

    private String notes;
}
