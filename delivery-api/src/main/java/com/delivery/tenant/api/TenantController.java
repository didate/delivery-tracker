package com.delivery.tenant.api;

import com.delivery.shared.security.CurrentUser;
import com.delivery.shared.security.UserPrincipal;
import com.delivery.tenant.application.dto.*;
import com.delivery.tenant.application.mapper.TenantMapper;
import com.delivery.tenant.domain.entity.Tenant;
import com.delivery.tenant.domain.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenant", description = "Tenant management APIs")
public class TenantController {

    private final TenantService tenantService;
    private final TenantMapper tenantMapper;

    @GetMapping("/me")
    @Operation(summary = "Get current tenant information")
    public ResponseEntity<TenantResponse> getCurrentTenant(@CurrentUser UserPrincipal currentUser) {
        Tenant tenant = tenantService.getTenantById(currentUser.getTenantId());
        return ResponseEntity.ok(tenantMapper.toResponse(tenant));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current tenant profile")
    public ResponseEntity<TenantResponse> updateTenant(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody UpdateTenantRequest request) {

        Tenant tenant = tenantService.updateTenant(
                currentUser.getTenantId(),
                request.getName(),
                request.getPhone(),
                request.getAddress(),
                request.getLogoUrl()
        );

        return ResponseEntity.ok(tenantMapper.toResponse(tenant));
    }

    @GetMapping("/me/settings")
    @Operation(summary = "Get tenant settings")
    public ResponseEntity<Map<String, String>> getSettings(@CurrentUser UserPrincipal currentUser) {
        Map<String, String> settings = tenantService.getSettings(currentUser.getTenantId());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/me/settings")
    @Operation(summary = "Update tenant settings")
    public ResponseEntity<Map<String, String>> updateSettings(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody TenantSettingsRequest request) {

        tenantService.saveSettings(currentUser.getTenantId(), request.getSettings());
        Map<String, String> settings = tenantService.getSettings(currentUser.getTenantId());
        return ResponseEntity.ok(settings);
    }
}
