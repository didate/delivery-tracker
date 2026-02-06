package com.delivery.tenant.application.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTenantRequest {

    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    private String address;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;
}
