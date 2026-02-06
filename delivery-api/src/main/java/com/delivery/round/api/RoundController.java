package com.delivery.round.api;

import com.delivery.round.application.dto.*;
import com.delivery.round.application.mapper.RoundMapper;
import com.delivery.round.domain.entity.Round;
import com.delivery.round.domain.entity.RoundCustomer;
import com.delivery.round.domain.entity.RoundStatus;
import com.delivery.round.domain.service.RoundService;
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

@RestController
@RequestMapping("/api/rounds")
@RequiredArgsConstructor
@Tag(name = "Rounds", description = "Delivery round management APIs")
public class RoundController {

    private final RoundService roundService;
    private final RoundMapper roundMapper;

    @PostMapping
    @Operation(summary = "Create a new round with customers")
    public ResponseEntity<RoundResponse> createRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreateRoundRequest request) {

        Round round = roundService.createRound(
                request.getName(),
                request.getDriverId(),
                request.getRoundDate(),
                request.getCustomerIds(),
                request.getNotes()
        );

        // Reload to get the customers
        round = roundService.getById(round.getId());
        List<RoundCustomer> customers = roundService.getRoundCustomers(round.getId());

        RoundResponse response = roundMapper.toResponseWithoutCustomers(round);
        response.setCustomers(roundMapper.toRoundCustomerResponseList(customers));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a round")
    public ResponseEntity<RoundResponse> updateRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoundRequest request) {

        Round round = roundService.updateRound(id, request.getName(), request.getNotes());
        List<RoundCustomer> customers = roundService.getRoundCustomers(round.getId());

        RoundResponse response = roundMapper.toResponseWithoutCustomers(round);
        response.setCustomers(roundMapper.toRoundCustomerResponseList(customers));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update round status")
    public ResponseEntity<RoundResponse> updateRoundStatus(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoundStatusRequest request) {

        Round round = roundService.updateRoundStatus(id, request.getStatus());
        List<RoundCustomer> customers = roundService.getRoundCustomers(round.getId());

        RoundResponse response = roundMapper.toResponseWithoutCustomers(round);
        response.setCustomers(roundMapper.toRoundCustomerResponseList(customers));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start a round")
    public ResponseEntity<RoundResponse> startRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Round round = roundService.startRound(id);
        List<RoundCustomer> customers = roundService.getRoundCustomers(round.getId());

        RoundResponse response = roundMapper.toResponseWithoutCustomers(round);
        response.setCustomers(roundMapper.toRoundCustomerResponseList(customers));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete a round")
    public ResponseEntity<RoundResponse> completeRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Round round = roundService.completeRound(id);
        List<RoundCustomer> customers = roundService.getRoundCustomers(round.getId());

        RoundResponse response = roundMapper.toResponseWithoutCustomers(round);
        response.setCustomers(roundMapper.toRoundCustomerResponseList(customers));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a round by ID with customers")
    public ResponseEntity<RoundResponse> getRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Round round = roundService.getById(id);
        List<RoundCustomer> customers = roundService.getRoundCustomers(id);

        RoundResponse response = roundMapper.toResponseWithoutCustomers(round);
        response.setCustomers(roundMapper.toRoundCustomerResponseList(customers));

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List rounds with filters")
    public ResponseEntity<Page<RoundResponse>> listRounds(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) RoundStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Round> rounds = roundService.listRounds(driverId, date, status, pageable);
        Page<RoundResponse> response = rounds.map(roundMapper::toResponseWithoutCustomers);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/customers")
    @Operation(summary = "Add a customer to a round")
    public ResponseEntity<RoundCustomerResponse> addCustomerToRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody AddCustomerToRoundRequest request) {

        RoundCustomer roundCustomer = roundService.addCustomerToRound(
                id,
                request.getCustomerId(),
                request.getSequenceOrder()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roundMapper.toRoundCustomerResponse(roundCustomer));
    }

    @DeleteMapping("/{id}/customers/{customerId}")
    @Operation(summary = "Remove a customer from a round")
    public ResponseEntity<Void> removeCustomerFromRound(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @PathVariable UUID customerId) {

        roundService.removeCustomerFromRound(id, customerId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/customers/reorder")
    @Operation(summary = "Reorder customers in a round")
    public ResponseEntity<List<RoundCustomerResponse>> reorderCustomers(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody ReorderCustomersRequest request) {

        roundService.reorderCustomers(id, request.getCustomerIds());
        List<RoundCustomer> customers = roundService.getRoundCustomers(id);

        return ResponseEntity.ok(roundMapper.toRoundCustomerResponseList(customers));
    }

    @PatchMapping("/{id}/customers/{customerId}/visited")
    @Operation(summary = "Mark a customer as visited")
    public ResponseEntity<RoundCustomerResponse> markCustomerVisited(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @PathVariable UUID customerId,
            @RequestBody(required = false) MarkVisitedRequest request) {

        UUID deliveryId = request != null ? request.getDeliveryId() : null;
        RoundCustomer roundCustomer = roundService.markCustomerVisited(id, customerId, deliveryId);

        return ResponseEntity.ok(roundMapper.toRoundCustomerResponse(roundCustomer));
    }

    @GetMapping("/{id}/progress")
    @Operation(summary = "Get round progress")
    public ResponseEntity<RoundProgressResponse> getRoundProgress(
            @Parameter(hidden = true) @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        RoundService.RoundProgress progress = roundService.getRoundProgress(id);

        double percentage = progress.total() > 0
                ? (double) progress.visited() / progress.total() * 100
                : 0;

        RoundProgressResponse response = RoundProgressResponse.builder()
                .roundId(id)
                .visited(progress.visited())
                .total(progress.total())
                .percentage(percentage)
                .build();

        return ResponseEntity.ok(response);
    }
}
