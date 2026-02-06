package com.delivery.payment.application.dto;

import com.delivery.payment.domain.entity.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
public class PaymentSummaryResponse {

    private BigDecimal totalAmount;
    private Long totalCount;
    private Map<PaymentMethod, BigDecimal> totalByMethod;
    private LocalDate startDate;
    private LocalDate endDate;
}
