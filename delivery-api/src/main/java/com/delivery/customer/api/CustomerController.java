package com.delivery.customer.api;

import com.delivery.customer.application.dto.*;
import com.delivery.customer.application.mapper.CustomerMapper;
import com.delivery.customer.domain.entity.Customer;
import com.delivery.customer.domain.service.CustomerService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer management APIs")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerMapper customerMapper;

    @PostMapping
    @Operation(summary = "Create a new customer")
    public ResponseEntity<CustomerResponse> createCustomer(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @Valid @RequestBody CreateCustomerRequest request) {

        Customer customer = customerService.createCustomer(
                request.getCode(),
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude(),
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerMapper.toResponse(customer));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a customer")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerRequest request) {

        Customer customer = customerService.updateCustomer(
                id,
                request.getCode(),
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude(),
                request.getNotes()
        );

        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a customer")
    public ResponseEntity<Void> deleteCustomer(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a customer by ID")
    public ResponseEntity<CustomerResponse> getCustomer(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Customer customer = customerService.getById(id);
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @GetMapping
    @Operation(summary = "List customers with pagination and optional search")
    public ResponseEntity<CustomerListResponse> listCustomers(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Customer> customersPage;

        if (search != null && !search.isBlank()) {
            customersPage = customerService.searchByName(search, active, pageable);
        } else if (active != null && active) {
            customersPage = customerService.listActiveByTenant(pageable);
        } else if (active != null && !active) {
            customersPage = customerService.searchByName("", active, pageable);
        } else {
            customersPage = customerService.listByTenant(pageable);
        }

        return ResponseEntity.ok(buildListResponse(customersPage));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get a customer by code")
    public ResponseEntity<CustomerResponse> getCustomerByCode(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable String code) {

        Customer customer = customerService.getByCode(code);
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a customer")
    public ResponseEntity<CustomerResponse> activateCustomer(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Customer customer = customerService.activateCustomer(id);
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a customer")
    public ResponseEntity<CustomerResponse> deactivateCustomer(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Customer customer = customerService.deactivateCustomer(id);
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PatchMapping("/{id}/assign-driver")
    @Operation(summary = "Assign a driver to a customer")
    public ResponseEntity<CustomerResponse> assignDriver(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignDriverRequest request) {

        Customer customer = customerService.assignDriver(id, request.getDriverId());
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PatchMapping("/{id}/unassign-driver")
    @Operation(summary = "Unassign driver from a customer")
    public ResponseEntity<CustomerResponse> unassignDriver(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Customer customer = customerService.unassignDriver(id);
        return ResponseEntity.ok(customerMapper.toResponse(customer));
    }

    @PostMapping("/bulk-assign-driver")
    @Operation(summary = "Assign a driver to multiple customers")
    public ResponseEntity<List<CustomerResponse>> bulkAssignDriver(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @Valid @RequestBody BulkAssignDriverRequest request) {

        List<Customer> customers = customerService.assignDriverToMultipleCustomers(
                request.getDriverId(),
                request.getCustomerIds()
        );

        return ResponseEntity.ok(customers.stream()
                .map(customerMapper::toResponse)
                .toList());
    }

    @DeleteMapping("/driver/{driverId}/unassign-all")
    @Operation(summary = "Unassign a driver from all their customers")
    public ResponseEntity<List<CustomerResponse>> unassignDriverFromAll(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID driverId) {

        List<Customer> customers = customerService.unassignDriverFromAllCustomers(driverId);

        return ResponseEntity.ok(customers.stream()
                .map(customerMapper::toResponse)
                .toList());
    }

    @GetMapping("/driver/{driverId}")
    @Operation(summary = "List customers assigned to a specific driver")
    public ResponseEntity<CustomerListResponse> listByDriver(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID driverId,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Customer> customersPage;

        if (active != null) {
            customersPage = customerService.listByDriverAndActive(driverId, active, pageable);
        } else {
            customersPage = customerService.listByDriver(driverId, pageable);
        }

        return ResponseEntity.ok(buildListResponse(customersPage));
    }

    @GetMapping("/unassigned")
    @Operation(summary = "List customers without a driver assigned")
    public ResponseEntity<CustomerListResponse> listUnassigned(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Customer> customersPage;

        if (active != null) {
            customersPage = customerService.listUnassignedAndActive(active, pageable);
        } else {
            customersPage = customerService.listUnassigned(pageable);
        }

        return ResponseEntity.ok(buildListResponse(customersPage));
    }

    @GetMapping("/driver/{driverId}/count")
    @Operation(summary = "Count customers assigned to a specific driver")
    public ResponseEntity<Long> countByDriver(
            @CurrentUser @Parameter(hidden = true) UserPrincipal userPrincipal,
            @PathVariable UUID driverId) {

        long count = customerService.countByDriver(driverId);
        return ResponseEntity.ok(count);
    }

    private CustomerListResponse buildListResponse(Page<Customer> customersPage) {
        return CustomerListResponse.builder()
                .customers(customersPage.getContent().stream()
                        .map(customerMapper::toResponse)
                        .toList())
                .page(customersPage.getNumber())
                .size(customersPage.getSize())
                .totalElements(customersPage.getTotalElements())
                .totalPages(customersPage.getTotalPages())
                .first(customersPage.isFirst())
                .last(customersPage.isLast())
                .build();
    }
}
