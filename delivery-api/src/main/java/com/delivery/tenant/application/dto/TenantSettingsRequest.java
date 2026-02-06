package com.delivery.tenant.application.dto;

import lombok.Data;

import java.util.Map;

@Data
public class TenantSettingsRequest {

    private Map<String, String> settings;
}
