package com.delivery.round.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RoundProgressResponse {

    private UUID roundId;
    private long visited;
    private long total;
    private double percentage;
}
