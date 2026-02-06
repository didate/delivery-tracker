package com.delivery.payment.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CustomerBalanceResponse {

    private UUID customerId;
    private String customerName;
    private BigDecimal totalDeliveries;
    private BigDecimal totalPayments;
    private BigDecimal balance;
}
