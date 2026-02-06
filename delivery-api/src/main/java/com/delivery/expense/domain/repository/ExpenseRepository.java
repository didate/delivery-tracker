package com.delivery.expense.domain.repository;

import com.delivery.expense.domain.entity.Expense;
import com.delivery.expense.domain.entity.ExpenseCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    Optional<Expense> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<Expense> findByTenantId(UUID tenantId, Pageable pageable);

    List<Expense> findByTenantId(UUID tenantId);

    Page<Expense> findByTenantIdAndCategory(UUID tenantId, ExpenseCategory category, Pageable pageable);

    List<Expense> findByTenantIdAndCategory(UUID tenantId, ExpenseCategory category);

    Page<Expense> findByTenantIdAndExpenseDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<Expense> findByTenantIdAndExpenseDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate);

    Page<Expense> findByTenantIdAndDriverId(UUID tenantId, UUID driverId, Pageable pageable);

    List<Expense> findByTenantIdAndDriverId(UUID tenantId, UUID driverId);

    Page<Expense> findByTenantIdAndProductionSiteId(UUID tenantId, UUID productionSiteId, Pageable pageable);

    List<Expense> findByTenantIdAndProductionSiteId(UUID tenantId, UUID productionSiteId);

    Page<Expense> findByTenantIdAndCategoryAndExpenseDateBetween(
            UUID tenantId, ExpenseCategory category, LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<Expense> findByTenantIdAndCategoryAndExpenseDateBetween(
            UUID tenantId, ExpenseCategory category, LocalDate startDate, LocalDate endDate);

    Page<Expense> findByTenantIdAndDriverIdAndExpenseDateBetween(
            UUID tenantId, UUID driverId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Expense> findByTenantIdAndProductionSiteIdAndExpenseDateBetween(
            UUID tenantId, UUID productionSiteId, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
