package com.delivery.expense.domain.service;

import com.delivery.expense.domain.entity.Expense;
import com.delivery.expense.domain.entity.ExpenseCategory;
import com.delivery.expense.domain.repository.ExpenseRepository;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Transactional
    public Expense createExpense(String description, BigDecimal amount, ExpenseCategory category,
                                  LocalDate expenseDate, UUID driverId, UUID productionSiteId, String notes) {
        Expense expense = Expense.builder()
                .description(description)
                .amount(amount)
                .category(category)
                .expenseDate(expenseDate)
                .driverId(driverId)
                .productionSiteId(productionSiteId)
                .notes(notes)
                .build();

        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(UUID id, String description, BigDecimal amount, ExpenseCategory category,
                                  LocalDate expenseDate, UUID driverId, UUID productionSiteId, String notes) {
        Expense expense = getById(id);

        if (description != null) {
            expense.setDescription(description);
        }

        if (amount != null) {
            expense.setAmount(amount);
        }

        if (category != null) {
            expense.setCategory(category);
        }

        if (expenseDate != null) {
            expense.setExpenseDate(expenseDate);
        }

        expense.setDriverId(driverId);
        expense.setProductionSiteId(productionSiteId);

        if (notes != null) {
            expense.setNotes(notes);
        }

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(UUID id) {
        Expense expense = getById(id);
        expenseRepository.delete(expense);
    }

    public Expense getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return expenseRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
    }

    public Page<Expense> listByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return expenseRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Expense> listByCategory(ExpenseCategory category, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return expenseRepository.findByTenantIdAndCategory(tenantId, category, pageable);
    }

    public Page<Expense> listByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return expenseRepository.findByTenantIdAndExpenseDateBetween(tenantId, startDate, endDate, pageable);
    }

    public Page<Expense> listByDriver(UUID driverId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return expenseRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
    }

    public Page<Expense> listByProductionSite(UUID productionSiteId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return expenseRepository.findByTenantIdAndProductionSiteId(tenantId, productionSiteId, pageable);
    }

    public BigDecimal calculateTotal() {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Expense> expenses = expenseRepository.findByTenantId(tenantId);
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotalByCategory(ExpenseCategory category) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Expense> expenses = expenseRepository.findByTenantIdAndCategory(tenantId, category);
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotalByDateRange(LocalDate startDate, LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Expense> expenses = expenseRepository.findByTenantIdAndExpenseDateBetween(tenantId, startDate, endDate);
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotalByDriver(UUID driverId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Expense> expenses = expenseRepository.findByTenantIdAndDriverId(tenantId, driverId);
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotalByProductionSite(UUID productionSiteId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Expense> expenses = expenseRepository.findByTenantIdAndProductionSiteId(tenantId, productionSiteId);
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Page<Expense> listWithFilters(ExpenseCategory category, LocalDate startDate, LocalDate endDate,
                                          UUID driverId, UUID productionSiteId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        // Apply filters based on what's provided
        if (category != null && startDate != null && endDate != null) {
            return expenseRepository.findByTenantIdAndCategoryAndExpenseDateBetween(
                    tenantId, category, startDate, endDate, pageable);
        }

        if (driverId != null && startDate != null && endDate != null) {
            return expenseRepository.findByTenantIdAndDriverIdAndExpenseDateBetween(
                    tenantId, driverId, startDate, endDate, pageable);
        }

        if (productionSiteId != null && startDate != null && endDate != null) {
            return expenseRepository.findByTenantIdAndProductionSiteIdAndExpenseDateBetween(
                    tenantId, productionSiteId, startDate, endDate, pageable);
        }

        if (category != null) {
            return expenseRepository.findByTenantIdAndCategory(tenantId, category, pageable);
        }

        if (startDate != null && endDate != null) {
            return expenseRepository.findByTenantIdAndExpenseDateBetween(tenantId, startDate, endDate, pageable);
        }

        if (driverId != null) {
            return expenseRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
        }

        if (productionSiteId != null) {
            return expenseRepository.findByTenantIdAndProductionSiteId(tenantId, productionSiteId, pageable);
        }

        return expenseRepository.findByTenantId(tenantId, pageable);
    }
}
