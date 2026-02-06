package com.delivery.returns.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ReturnResponse {

    private UUID id;
    private UUID customerId;
    private String customerName;
    private String customerCode;
    private UUID driverId;
    private String driverName;
    private LocalDate returnDate;
    private String notes;
    private List<ReturnItemResponse> items;
    private Integer totalItems;
    private Integer totalQuantity;
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
}
