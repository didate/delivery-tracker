package com.delivery.driver.api;

import com.delivery.driver.application.dto.CreateProductionSiteRequest;
import com.delivery.driver.application.dto.ProductionSiteResponse;
import com.delivery.driver.application.dto.UpdateProductionSiteRequest;
import com.delivery.driver.application.mapper.ProductionSiteMapper;
import com.delivery.driver.domain.entity.ProductionSite;
import com.delivery.driver.domain.service.ProductionSiteService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/production-sites")
@RequiredArgsConstructor
@Tag(name = "Production Sites", description = "Production site management APIs")
public class ProductionSiteController {

    private final ProductionSiteService productionSiteService;
    private final ProductionSiteMapper productionSiteMapper;

    @PostMapping
    @Operation(summary = "Create a new production site")
    public ResponseEntity<ProductionSiteResponse> createProductionSite(
            @Valid @RequestBody CreateProductionSiteRequest request) {

        ProductionSite productionSite = productionSiteService.createProductionSite(
                request.getName(),
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productionSiteMapper.toResponse(productionSite));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a production site by ID")
    public ResponseEntity<ProductionSiteResponse> getProductionSite(@PathVariable UUID id) {
        ProductionSite productionSite = productionSiteService.getProductionSiteById(id);
        return ResponseEntity.ok(productionSiteMapper.toResponse(productionSite));
    }

    @GetMapping
    @Operation(summary = "List production sites with pagination")
    public ResponseEntity<Page<ProductionSiteResponse>> listProductionSites(
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ProductionSite> productionSites = productionSiteService.listProductionSites(active, pageable);
        Page<ProductionSiteResponse> response = productionSites.map(productionSiteMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a production site")
    public ResponseEntity<ProductionSiteResponse> updateProductionSite(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductionSiteRequest request) {

        ProductionSite productionSite = productionSiteService.updateProductionSite(
                id,
                request.getName(),
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude()
        );

        return ResponseEntity.ok(productionSiteMapper.toResponse(productionSite));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a production site")
    public ResponseEntity<Void> deactivateProductionSite(@PathVariable UUID id) {
        productionSiteService.deactivateProductionSite(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate a production site")
    public ResponseEntity<ProductionSiteResponse> activateProductionSite(@PathVariable UUID id) {
        productionSiteService.activateProductionSite(id);
        ProductionSite productionSite = productionSiteService.getProductionSiteById(id);
        return ResponseEntity.ok(productionSiteMapper.toResponse(productionSite));
    }
}
