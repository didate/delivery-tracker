package com.delivery.payment.api;

import com.delivery.customer.domain.entity.Customer;
import com.delivery.customer.domain.service.CustomerService;
import com.delivery.delivery.domain.repository.DeliveryRepository;
import com.delivery.driver.domain.entity.Driver;
import com.delivery.driver.domain.service.DriverService;
import com.delivery.payment.application.dto.*;
import com.delivery.payment.application.mapper.PaymentMapper;
import com.delivery.payment.domain.entity.Payment;
import com.delivery.payment.domain.entity.PaymentMethod;
import com.delivery.payment.domain.service.PaymentService;
import com.delivery.shared.security.CurrentUser;
import com.delivery.shared.security.UserPrincipal;
import com.delivery.shared.tenant.TenantContext;
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
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management APIs")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;
    private final CustomerService customerService;
    private final DriverService driverService;
    private final DeliveryRepository deliveryRepository;

    @PostMapping
    @Operation(summary = "Create a new payment")
    public ResponseEntity<PaymentResponse> createPayment(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePaymentRequest request) {

        Payment payment = paymentService.createPayment(
                request.getCustomerId(),
                request.getDriverId(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getPaymentDate(),
                request.getReference(),
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentMapper.toResponse(payment));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a payment")
    public ResponseEntity<PaymentResponse> updatePayment(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePaymentRequest request) {

        Payment payment = paymentService.updatePayment(
                id,
                request.getAmount(),
                request.getPaymentMethod(),
                request.getReference(),
                request.getNotes()
        );

        return ResponseEntity.ok(paymentMapper.toResponse(payment));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a payment")
    public ResponseEntity<Void> deletePayment(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a payment by ID")
    public ResponseEntity<PaymentResponse> getPayment(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Payment payment = paymentService.getById(id);
        return ResponseEntity.ok(paymentMapper.toResponse(payment));
    }

    @GetMapping
    @Operation(summary = "List payments with optional filters")
    public ResponseEntity<Page<PaymentResponse>> listPayments(
            @CurrentUser UserPrincipal userPrincipal,
            @Parameter(description = "Filter by customer ID")
            @RequestParam(required = false) UUID customerId,
            @Parameter(description = "Filter by driver ID")
            @RequestParam(required = false) UUID driverId,
            @Parameter(description = "Filter by specific date")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Filter by payment method")
            @RequestParam(required = false) PaymentMethod method,
            @Parameter(description = "Filter by start date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Filter by end date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Payment> payments = paymentService.listWithFilters(
                customerId, driverId, date, method, startDate, endDate, pageable);

        Page<PaymentResponse> response = payments.map(paymentMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/{customerId}/balance")
    @Operation(summary = "Get customer balance (total deliveries - total payments)")
    public ResponseEntity<CustomerBalanceResponse> getCustomerBalance(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID customerId) {

        UUID tenantId = TenantContext.getCurrentTenant();
        Customer customer = customerService.getById(customerId);

        BigDecimal totalDeliveries = deliveryRepository.sumTotalAmountByTenantIdAndCustomerId(tenantId, customerId);
        BigDecimal totalPayments = paymentService.getTotalPaymentsByCustomer(customerId);
        BigDecimal balance = totalDeliveries.subtract(totalPayments);

        CustomerBalanceResponse response = CustomerBalanceResponse.builder()
                .customerId(customerId)
                .customerName(customer.getName())
                .totalDeliveries(totalDeliveries)
                .totalPayments(totalPayments)
                .balance(balance)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get payment summary with totals by method")
    public ResponseEntity<PaymentSummaryResponse> getPaymentSummary(
            @CurrentUser UserPrincipal userPrincipal,
            @Parameter(description = "Start date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        BigDecimal totalAmount = paymentService.getTotalPayments();
        long totalCount = paymentService.listByTenant(Pageable.unpaged()).getTotalElements();

        Map<PaymentMethod, BigDecimal> totalByMethod = Arrays.stream(PaymentMethod.values())
                .collect(Collectors.toMap(
                        method -> method,
                        paymentService::getTotalByPaymentMethod
                ));

        PaymentSummaryResponse summary = PaymentSummaryResponse.builder()
                .totalAmount(totalAmount)
                .totalCount(totalCount)
                .totalByMethod(totalByMethod)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/driver/{driverId}/collections")
    @Operation(summary = "Get driver collections summary")
    public ResponseEntity<DriverCollectionResponse> getDriverCollections(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID driverId,
            @Parameter(description = "Start date for collections")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for collections")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Driver driver = driverService.getById(driverId);

        BigDecimal totalCollections;
        List<PaymentResponse> payments;

        if (startDate != null && endDate != null) {
            totalCollections = paymentService.getTotalCollectionsByDriverAndDateRange(driverId, startDate, endDate);
            payments = paymentService.listByDriverAndDateRange(driverId, startDate, endDate)
                    .stream()
                    .map(paymentMapper::toResponse)
                    .collect(Collectors.toList());
        } else {
            totalCollections = paymentService.getTotalCollectionsByDriver(driverId);
            Page<Payment> paymentPage = paymentService.listByDriver(driverId, Pageable.unpaged());
            payments = paymentPage.getContent()
                    .stream()
                    .map(paymentMapper::toResponse)
                    .collect(Collectors.toList());
        }

        DriverCollectionResponse response = DriverCollectionResponse.builder()
                .driverId(driverId)
                .driverName(driver.getName())
                .totalCollections(totalCollections)
                .paymentCount((long) payments.size())
                .startDate(startDate)
                .endDate(endDate)
                .payments(payments)
                .build();

        return ResponseEntity.ok(response);
    }
}
