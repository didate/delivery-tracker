package com.delivery.production.api;

import com.delivery.production.application.dto.CreateProductionRequest;
import com.delivery.production.application.dto.ProductionResponse;
import com.delivery.production.application.dto.ProductionSummaryResponse;
import com.delivery.production.application.dto.UpdateProductionRequest;
import com.delivery.production.application.mapper.ProductionMapper;
import com.delivery.production.domain.entity.Production;
import com.delivery.production.domain.service.ProductionService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productions")
@RequiredArgsConstructor
@Tag(name = "Productions", description = "Production management APIs")
public class ProductionController {

    private final ProductionService productionService;
    private final ProductionMapper productionMapper;

    @PostMapping
    @Operation(summary = "Create a new production record")
    public ResponseEntity<ProductionResponse> createProduction(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateProductionRequest request) {

        Production production = productionService.createProduction(
                request.getProductionSiteId(),
                request.getProductId(),
                request.getQuantity(),
                request.getProductionDate(),
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productionMapper.toResponse(production));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a production record")
    public ResponseEntity<ProductionResponse> updateProduction(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductionRequest request) {

        Production production = productionService.updateProduction(
                id,
                request.getProductionSiteId(),
                request.getProductId(),
                request.getQuantity(),
                request.getProductionDate(),
                request.getNotes()
        );

        return ResponseEntity.ok(productionMapper.toResponse(production));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a production record")
    public ResponseEntity<Void> deleteProduction(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {

        productionService.deleteProduction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a production record by ID")
    public ResponseEntity<ProductionResponse> getProduction(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {

        Production production = productionService.getById(id);
        return ResponseEntity.ok(productionMapper.toResponse(production));
    }

    @GetMapping
    @Operation(summary = "List production records with optional filters")
    public ResponseEntity<Page<ProductionResponse>> listProductions(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "Filter by production site ID")
            @RequestParam(required = false) UUID productionSiteId,
            @Parameter(description = "Filter by product ID")
            @RequestParam(required = false) UUID productId,
            @Parameter(description = "Filter by start date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Filter by end date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Production> productions = productionService.listByFilters(
                productionSiteId, productId, startDate, endDate, pageable);
        Page<ProductionResponse> response = productions.map(productionMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get production summary aggregated by product")
    public ResponseEntity<List<ProductionSummaryResponse>> getProductionSummary(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "Filter by production site ID")
            @RequestParam(required = false) UUID productionSiteId,
            @Parameter(description = "Filter by start date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Filter by end date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ProductionService.ProductionSummary> summaries = productionService.getProductionSummary(
                productionSiteId, startDate, endDate);

        List<ProductionSummaryResponse> response = summaries.stream()
                .map(productionMapper::toSummaryResponse).toList();

        return ResponseEntity.ok(response);
    }
}
