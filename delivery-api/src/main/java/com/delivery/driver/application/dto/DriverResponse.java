package com.delivery.driver.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class DriverResponse {

    private UUID id;
    private String name;
    private String phone;
    private String licenseNumber;
    private UUID userId;
    private UUID productionSiteId;
    private String productionSiteName;
    private boolean active;
    private Instant createdDate;
    private Instant lastModifiedDate;
}
