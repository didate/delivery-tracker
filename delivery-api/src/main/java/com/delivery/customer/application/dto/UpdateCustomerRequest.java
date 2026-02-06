package com.delivery.customer.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCustomerRequest {

    @Size(max = 50, message = "Code must not exceed 50 characters")
    private String code;

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String notes;
}
