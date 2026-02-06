package com.delivery.round.application.dto;

import com.delivery.round.domain.entity.RoundStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RoundResponse {

    private UUID id;
    private String name;
    private UUID driverId;
    private String driverName;
    private LocalDate roundDate;
    private RoundStatus status;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;
    private List<RoundCustomerResponse> customers;
    private Instant createdDate;
    private Instant lastModifiedDate;
}
