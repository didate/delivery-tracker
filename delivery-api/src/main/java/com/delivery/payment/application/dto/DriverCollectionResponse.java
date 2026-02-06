package com.delivery.payment.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DriverCollectionResponse {

    private UUID driverId;
    private String driverName;
    private BigDecimal totalCollections;
    private Long paymentCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<PaymentResponse> payments;
}
