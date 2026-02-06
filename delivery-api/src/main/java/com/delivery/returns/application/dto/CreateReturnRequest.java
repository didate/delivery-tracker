package com.delivery.returns.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateReturnRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Return date is required")
    @PastOrPresent(message = "Return date cannot be in the future")
    private LocalDate returnDate;

    @Valid
    @NotEmpty(message = "At least one return item is required")
    private List<CreateReturnItemRequest> items;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
