package com.delivery.delivery.api;

import com.delivery.delivery.application.dto.*;
import com.delivery.delivery.application.mapper.DeliveryMapper;
import com.delivery.delivery.domain.entity.Delivery;
import com.delivery.delivery.domain.entity.DeliveryItem;
import com.delivery.delivery.domain.entity.DeliveryStatus;
import com.delivery.delivery.domain.service.DeliveryService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@Tag(name = "Deliveries", description = "Delivery management APIs")
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final DeliveryMapper deliveryMapper;

    @PostMapping
    @Operation(summary = "Create a new delivery with items")
    public ResponseEntity<DeliveryResponse> createDelivery(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @Valid @RequestBody CreateDeliveryRequest request) {

        Delivery delivery = deliveryService.createDelivery(
                request.getCustomerId(),
                request.getDriverId(),
                request.getDeliveryDate(),
                request.getItems(),
                request.getNotes()
        );

        // Reload to get relationships
        delivery = deliveryService.getById(delivery.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(deliveryMapper.toResponse(delivery));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a delivery by ID with items")
    public ResponseEntity<DeliveryResponse> getDelivery(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Delivery delivery = deliveryService.getById(id);
        return ResponseEntity.ok(deliveryMapper.toResponse(delivery));
    }

    @GetMapping
    @Operation(summary = "List deliveries with filters")
    public ResponseEntity<DeliveryListResponse> listDeliveries(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) DeliveryStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Delivery> deliveriesPage;

        if (customerId != null && startDate != null && endDate != null) {
            deliveriesPage = deliveryService.listByCustomerAndDateRange(customerId, startDate, endDate, pageable);
        } else if (driverId != null && startDate != null && endDate != null) {
            deliveriesPage = deliveryService.listByDriverAndDateRange(driverId, startDate, endDate, pageable);
        } else if (customerId != null && status != null) {
            deliveriesPage = deliveryService.listByCustomerAndStatus(customerId, status, pageable);
        } else if (driverId != null && status != null) {
            deliveriesPage = deliveryService.listByDriverAndStatus(driverId, status, pageable);
        } else if (customerId != null) {
            deliveriesPage = deliveryService.listByCustomer(customerId, pageable);
        } else if (driverId != null) {
            deliveriesPage = deliveryService.listByDriver(driverId, pageable);
        } else if (date != null) {
            deliveriesPage = deliveryService.listByDate(date, pageable);
        } else if (startDate != null && endDate != null) {
            deliveriesPage = deliveryService.listByDateRange(startDate, endDate, pageable);
        } else if (status != null) {
            deliveriesPage = deliveryService.listByStatus(status, pageable);
        } else {
            deliveriesPage = deliveryService.listByTenant(pageable);
        }

        return ResponseEntity.ok(buildListResponse(deliveriesPage));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update delivery status")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatus(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDeliveryStatusRequest request) {

        Delivery delivery = deliveryService.updateDeliveryStatus(id, request.getStatus());
        return ResponseEntity.ok(deliveryMapper.toResponse(delivery));
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add an item to a delivery")
    public ResponseEntity<DeliveryItemResponse> addDeliveryItem(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody AddDeliveryItemRequest request) {

        DeliveryItem item = deliveryService.addDeliveryItem(
                id,
                request.getProductId(),
                request.getQuantity(),
                request.getUnitPrice()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(deliveryMapper.toItemResponse(item));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "Remove an item from a delivery")
    public ResponseEntity<Void> removeDeliveryItem(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @PathVariable UUID itemId) {

        deliveryService.removeDeliveryItem(id, itemId);
        return ResponseEntity.noContent().build();
    }

    private DeliveryListResponse buildListResponse(Page<Delivery> deliveriesPage) {
        return DeliveryListResponse.builder()
                .deliveries(deliveriesPage.getContent().stream()
                        .map(deliveryMapper::toResponse)
                        .toList())
                .page(deliveriesPage.getNumber())
                .size(deliveriesPage.getSize())
                .totalElements(deliveriesPage.getTotalElements())
                .totalPages(deliveriesPage.getTotalPages())
                .first(deliveriesPage.isFirst())
                .last(deliveriesPage.isLast())
                .build();
    }
}
