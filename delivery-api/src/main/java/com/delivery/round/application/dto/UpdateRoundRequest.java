package com.delivery.round.application.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateRoundRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String notes;
}
