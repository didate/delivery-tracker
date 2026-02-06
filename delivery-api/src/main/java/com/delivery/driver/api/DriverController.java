package com.delivery.driver.api;

import com.delivery.driver.application.dto.AssignProductionSiteRequest;
import com.delivery.driver.application.dto.CreateDriverRequest;
import com.delivery.driver.application.dto.DriverResponse;
import com.delivery.driver.application.dto.UpdateDriverRequest;
import com.delivery.driver.application.mapper.DriverMapper;
import com.delivery.driver.domain.entity.Driver;
import com.delivery.driver.domain.service.DriverService;
import com.delivery.shared.security.CurrentUser;
import com.delivery.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@Tag(name = "Drivers", description = "Driver management APIs")
public class DriverController {

    private final DriverService driverService;
    private final DriverMapper driverMapper;

    @PostMapping
    @Operation(summary = "Create a new driver")
    public ResponseEntity<DriverResponse> createDriver(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreateDriverRequest request) {

        Driver driver = driverService.createDriver(
                request.getName(),
                request.getPhone(),
                request.getLicenseNumber(),
                request.getUserId(),
                request.getProductionSiteId()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(driverMapper.toResponse(driver));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a driver")
    public ResponseEntity<DriverResponse> updateDriver(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDriverRequest request) {

        Driver driver = driverService.updateDriver(
                id,
                request.getName(),
                request.getPhone(),
                request.getLicenseNumber(),
                request.getUserId()
        );

        return ResponseEntity.ok(driverMapper.toResponse(driver));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a driver by ID")
    public ResponseEntity<DriverResponse> getDriver(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Driver driver = driverService.getById(id);
        return ResponseEntity.ok(driverMapper.toResponse(driver));
    }

    @GetMapping
    @Operation(summary = "List drivers with pagination")
    public ResponseEntity<Page<DriverResponse>> listDrivers(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) UUID productionSiteId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Driver> drivers;
        if (productionSiteId != null) {
            drivers = driverService.listByProductionSite(productionSiteId, pageable);
        } else {
            drivers = driverService.listByTenant(active, pageable);
        }

        Page<DriverResponse> response = drivers.map(driverMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a driver")
    public ResponseEntity<DriverResponse> activateDriver(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Driver driver = driverService.activateDriver(id);
        return ResponseEntity.ok(driverMapper.toResponse(driver));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a driver")
    public ResponseEntity<DriverResponse> deactivateDriver(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Driver driver = driverService.deactivateDriver(id);
        return ResponseEntity.ok(driverMapper.toResponse(driver));
    }

    @PatchMapping("/{id}/assign-site")
    @Operation(summary = "Assign a driver to a production site")
    public ResponseEntity<DriverResponse> assignToProductionSite(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignProductionSiteRequest request) {

        Driver driver = driverService.assignToProductionSite(id, request.getProductionSiteId());
        return ResponseEntity.ok(driverMapper.toResponse(driver));
    }
}
