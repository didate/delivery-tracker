package com.delivery.round.application.dto;

import com.delivery.round.domain.entity.RoundStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRoundStatusRequest {

    @NotNull(message = "Status is required")
    private RoundStatus status;
}
