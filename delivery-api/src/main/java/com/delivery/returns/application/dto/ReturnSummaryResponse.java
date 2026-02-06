package com.delivery.returns.application.dto;

import com.delivery.returns.domain.entity.ReturnReason;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class ReturnSummaryResponse {

    private Long totalReturnCount;
    private Long totalItemCount;
    private Integer totalQuantity;
    private BigDecimal totalDepositValue;
    private Map<UUID, ProductReturnSummary> returnsByProduct;
    private Map<ReturnReason, Long> returnsByReason;
    private LocalDate startDate;
    private LocalDate endDate;

    @Data
    @Builder
    public static class ProductReturnSummary {
        private UUID productId;
        private String productName;
        private String productCode;
        private Integer totalQuantity;
        private BigDecimal totalValue;
    }
}
