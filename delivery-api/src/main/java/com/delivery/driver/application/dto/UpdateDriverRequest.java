package com.delivery.driver.application.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateDriverRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 50, message = "License number must not exceed 50 characters")
    private String licenseNumber;

    private UUID userId;
}
