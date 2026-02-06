package com.delivery.driver.application.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AssignProductionSiteRequest {

    private UUID productionSiteId;
}
