package com.delivery.expense.api;

import com.delivery.expense.application.dto.*;
import com.delivery.expense.application.mapper.ExpenseMapper;
import com.delivery.expense.domain.entity.Expense;
import com.delivery.expense.domain.entity.ExpenseCategory;
import com.delivery.expense.domain.service.ExpenseService;
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
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Expense management APIs")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseMapper expenseMapper;

    @PostMapping
    @Operation(summary = "Create a new expense")
    public ResponseEntity<ExpenseResponse> createExpense(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreateExpenseRequest request) {

        Expense expense = expenseService.createExpense(
                request.getDescription(),
                request.getAmount(),
                request.getCategory(),
                request.getExpenseDate(),
                request.getDriverId(),
                request.getProductionSiteId(),
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseMapper.toResponse(expense));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an expense by ID")
    public ResponseEntity<ExpenseResponse> getExpense(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        Expense expense = expenseService.getById(id);
        return ResponseEntity.ok(expenseMapper.toResponse(expense));
    }

    @GetMapping
    @Operation(summary = "List expenses with optional filters")
    public ResponseEntity<Page<ExpenseResponse>> listExpenses(
            @CurrentUser UserPrincipal userPrincipal,
            @Parameter(description = "Filter by expense category")
            @RequestParam(required = false) ExpenseCategory category,
            @Parameter(description = "Filter by start date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Filter by end date (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Filter by driver ID")
            @RequestParam(required = false) UUID driverId,
            @Parameter(description = "Filter by production site ID")
            @RequestParam(required = false) UUID productionSiteId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Expense> expenses = expenseService.listWithFilters(
                category, startDate, endDate, driverId, productionSiteId, pageable);

        Page<ExpenseResponse> response = expenses.map(expenseMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an expense")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateExpenseRequest request) {

        Expense expense = expenseService.updateExpense(
                id,
                request.getDescription(),
                request.getAmount(),
                request.getCategory(),
                request.getExpenseDate(),
                request.getDriverId(),
                request.getProductionSiteId(),
                request.getNotes()
        );

        return ResponseEntity.ok(expenseMapper.toResponse(expense));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<Void> deleteExpense(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {

        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    @Operation(summary = "Get expense summary with totals")
    public ResponseEntity<ExpenseSummaryResponse> getExpenseSummary(
            @CurrentUser UserPrincipal userPrincipal,
            @Parameter(description = "Start date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        BigDecimal totalAmount;
        long totalCount;

        if (startDate != null && endDate != null) {
            totalAmount = expenseService.calculateTotalByDateRange(startDate, endDate);
            totalCount = expenseService.listByDateRange(startDate, endDate, Pageable.unpaged()).getTotalElements();
        } else {
            totalAmount = expenseService.calculateTotal();
            totalCount = expenseService.listByTenant(Pageable.unpaged()).getTotalElements();
        }

        Map<ExpenseCategory, BigDecimal> totalByCategory = Arrays.stream(ExpenseCategory.values())
                .collect(Collectors.toMap(
                        category -> category,
                        expenseService::calculateTotalByCategory
                ));

        ExpenseSummaryResponse summary = ExpenseSummaryResponse.builder()
                .totalAmount(totalAmount)
                .totalCount(totalCount)
                .totalByCategory(totalByCategory)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return ResponseEntity.ok(summary);
    }
}
