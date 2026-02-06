package com.delivery.returns.api;

import com.delivery.catalog.domain.entity.Product;
import com.delivery.catalog.domain.service.ProductService;
import com.delivery.returns.application.dto.*;
import com.delivery.returns.application.mapper.ProductReturnMapper;
import com.delivery.returns.domain.entity.ProductReturn;
import com.delivery.returns.domain.entity.ReturnItem;
import com.delivery.returns.domain.entity.ReturnReason;
import com.delivery.returns.domain.service.ProductReturnService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
@Tag(name = "Returns", description = "Product return management APIs")
public class ProductReturnController {

    private final ProductReturnService productReturnService;
    private final ProductReturnMapper productReturnMapper;
    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Create a new return with items")
    public ResponseEntity<ReturnResponse> createReturn(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReturnRequest request) {

        List<ReturnItem> items = productReturnMapper.toEntityList(request.getItems());

        ProductReturn productReturn = productReturnService.createReturn(
                request.getCustomerId(),
                request.getDriverId(),
                request.getReturnDate(),
                items,
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productReturnMapper.toResponse(productReturn));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a return by ID with its items")
    public ResponseEntity<ReturnResponse> getReturn(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        ProductReturn productReturn = productReturnService.getById(id);
        return ResponseEntity.ok(productReturnMapper.toResponse(productReturn));
    }

    @GetMapping
    @Operation(summary = "List returns with optional filters")
    public ResponseEntity<Page<ReturnResponse>> listReturns(
            @CurrentUser UserPrincipal userPrincipal,
            @Parameter(description = "Filter by customer ID")
            @RequestParam(required = false) UUID customerId,
            @Parameter(description = "Filter by driver ID")
            @RequestParam(required = false) UUID driverId,
            @Parameter(description = "Filter by exact date")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Filter by start date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Filter by end date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ProductReturn> returns = productReturnService.listWithFilters(
                customerId, driverId, date, startDate, endDate, pageable);

        Page<ReturnResponse> response = returns.map(productReturnMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add an item to an existing return")
    public ResponseEntity<ReturnItemResponse> addReturnItem(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody AddReturnItemRequest request) {

        ReturnItem item = productReturnService.addReturnItem(
                id,
                request.getProductId(),
                request.getQuantity(),
                request.getReason(),
                request.getUnitValue()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productReturnMapper.toItemResponse(item));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "Remove an item from a return")
    public ResponseEntity<Void> removeReturnItem(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @PathVariable UUID itemId) {

        productReturnService.removeReturnItem(id, itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated return summary")
    public ResponseEntity<ReturnSummaryResponse> getReturnSummary(
            @CurrentUser UserPrincipal userPrincipal,
            @Parameter(description = "Start date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Map<UUID, Integer> returnsByProduct;
        BigDecimal totalDepositValue;
        long totalReturnCount;

        if (startDate != null && endDate != null) {
            returnsByProduct = productReturnService.calculateTotalReturnsByDateRange(startDate, endDate);
            totalDepositValue = productReturnService.calculateTotalDepositValueByDateRange(startDate, endDate);
            totalReturnCount = productReturnService.listByDateRange(startDate, endDate, Pageable.unpaged()).getTotalElements();
        } else {
            returnsByProduct = productReturnService.calculateTotalReturns();
            totalDepositValue = productReturnService.calculateTotalDepositValue();
            totalReturnCount = productReturnService.listByTenant(Pageable.unpaged()).getTotalElements();
        }

        Map<ReturnReason, Long> returnsByReason = productReturnService.countByReason();

        // Build product summaries
        Map<UUID, ReturnSummaryResponse.ProductReturnSummary> productSummaries = new HashMap<>();
        for (Map.Entry<UUID, Integer> entry : returnsByProduct.entrySet()) {
            UUID productId = entry.getKey();
            Integer quantity = entry.getValue();

            try {
                Product product = productService.getProductById(productId);
                productSummaries.put(productId, ReturnSummaryResponse.ProductReturnSummary.builder()
                        .productId(productId)
                        .productName(product.getName())
                        .productCode(product.getCode())
                        .totalQuantity(quantity)
                        .totalValue(null) // Would need to aggregate unit values
                        .build());
            } catch (Exception e) {
                productSummaries.put(productId, ReturnSummaryResponse.ProductReturnSummary.builder()
                        .productId(productId)
                        .productName("Unknown")
                        .productCode("Unknown")
                        .totalQuantity(quantity)
                        .totalValue(null)
                        .build());
            }
        }

        int totalQuantity = returnsByProduct.values().stream().mapToInt(Integer::intValue).sum();
        long totalItemCount = returnsByReason.values().stream().mapToLong(Long::longValue).sum();

        ReturnSummaryResponse summary = ReturnSummaryResponse.builder()
                .totalReturnCount(totalReturnCount)
                .totalItemCount(totalItemCount)
                .totalQuantity(totalQuantity)
                .totalDepositValue(totalDepositValue)
                .returnsByProduct(productSummaries)
                .returnsByReason(returnsByReason)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return ResponseEntity.ok(summary);
    }
}
