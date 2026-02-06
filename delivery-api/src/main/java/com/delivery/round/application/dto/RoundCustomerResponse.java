package com.delivery.round.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class RoundCustomerResponse {

    private UUID id;
    private UUID roundId;
    private UUID customerId;
    private String customerName;
    private String customerCode;
    private String customerAddress;
    private String customerPhone;
    private Integer sequenceOrder;
    private boolean visited;
    private LocalTime visitTime;
    private UUID deliveryId;
    private Instant createdDate;
    private Instant lastModifiedDate;
}
