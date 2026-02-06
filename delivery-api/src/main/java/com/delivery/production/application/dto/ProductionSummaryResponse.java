package com.delivery.production.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProductionSummaryResponse {

    private UUID productId;
    private String productName;
    private Long totalQuantity;
}
