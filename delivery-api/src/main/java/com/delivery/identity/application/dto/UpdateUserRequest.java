package com.delivery.identity.application.dto;

import com.delivery.identity.domain.entity.Role;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private Role role;

    private Boolean active;
}
