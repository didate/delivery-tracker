package com.delivery.customer.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CustomerResponse {

    private UUID id;
    private String code;
    private String name;
    private String phone;
    private String email;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean active;
    private String notes;
    private UUID driverId;
    private String driverName;
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
}
