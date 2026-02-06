package com.delivery.returns.application.dto;

import com.delivery.returns.domain.entity.ReturnReason;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ReturnItemResponse {

    private UUID id;
    private UUID returnId;
    private UUID productId;
    private String productName;
    private String productCode;
    private Integer quantity;
    private ReturnReason reason;
    private BigDecimal unitValue;
    private BigDecimal totalValue;
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
}
