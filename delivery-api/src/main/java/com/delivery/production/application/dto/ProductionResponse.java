package com.delivery.production.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ProductionResponse {

    private UUID id;
    private UUID productionSiteId;
    private UUID productId;
    private Integer quantity;
    private LocalDate productionDate;
    private String notes;
    private Instant createdDate;
    private Instant lastModifiedDate;
    private String createdBy;
    private String lastModifiedBy;
}
