package com.delivery.tenant.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TenantRegistrationResponse {

    private TenantResponse tenant;
    private String accessToken;
    private String refreshToken;
}
