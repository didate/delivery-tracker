package com.delivery.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistoryResponse {

    private UUID id;
    private UUID productId;
    private BigDecimal price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
