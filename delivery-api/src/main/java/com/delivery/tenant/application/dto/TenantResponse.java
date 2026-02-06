package com.delivery.tenant.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class TenantResponse {

    private UUID id;
    private String code;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String logoUrl;
    private boolean active;
    private Instant createdDate;
}
