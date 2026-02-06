package com.delivery.driver.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProductionSiteResponse {

    private UUID id;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
