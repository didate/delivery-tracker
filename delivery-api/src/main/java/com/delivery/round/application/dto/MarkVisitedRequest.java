package com.delivery.round.application.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class MarkVisitedRequest {

    private UUID deliveryId;
}
