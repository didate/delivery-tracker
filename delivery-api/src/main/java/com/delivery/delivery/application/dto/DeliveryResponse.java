package com.delivery.delivery.application.dto;

import com.delivery.delivery.domain.entity.DeliveryStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DeliveryResponse {

    private UUID id;
    private UUID customerId;
    private String customerName;
    private String customerCode;
    private UUID driverId;
    private String driverName;
    private LocalDate deliveryDate;
    private DeliveryStatus status;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String notes;
    private List<DeliveryItemResponse> items;
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
}
