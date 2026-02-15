package com.delivery.service;

import com.delivery.domain.Expense;
import com.delivery.domain.Tenant;
import com.delivery.repository.ExpenseRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.ExpenseDTO;
import com.delivery.service.mapper.ExpenseMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Expense}.
 */
@Service
@Transactional
public class ExpenseService {

    private static final Logger LOG = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseRepository expenseRepository;

    private final ExpenseMapper expenseMapper;

    private final TenantRepository tenantRepository;

    public ExpenseService(ExpenseRepository expenseRepository, ExpenseMapper expenseMapper, TenantRepository tenantRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseMapper = expenseMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a expense.
     *
     * @param expenseDTO the entity to save.
     * @return the persisted entity.
     */
    public ExpenseDTO save(ExpenseDTO expenseDTO) {
        LOG.debug("Request to save Expense : {}", expenseDTO);
        Expense expense = expenseMapper.toEntity(expenseDTO);
        // Auto-set tenant from context for new entities
        if (expense.getId() == null && expense.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(expense::setTenant);
        }
        expense = expenseRepository.save(expense);
        return expenseMapper.toDto(expense);
    }

    /**
     * Update a expense.
     *
     * @param expenseDTO the entity to save.
     * @return the persisted entity.
     */
    public ExpenseDTO update(ExpenseDTO expenseDTO) {
        LOG.debug("Request to update Expense : {}", expenseDTO);
        Expense expense = expenseMapper.toEntity(expenseDTO);
        expense = expenseRepository.save(expense);
        return expenseMapper.toDto(expense);
    }

    /**
     * Partially update a expense.
     *
     * @param expenseDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ExpenseDTO> partialUpdate(ExpenseDTO expenseDTO) {
        LOG.debug("Request to partially update Expense : {}", expenseDTO);

        return expenseRepository
            .findById(expenseDTO.getId())
            .map(existingExpense -> {
                expenseMapper.partialUpdate(existingExpense, expenseDTO);

                return existingExpense;
            })
            .map(expenseRepository::save)
            .map(expenseMapper::toDto);
    }

    /**
     * Get one expense by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseDTO> findOne(Long id) {
        LOG.debug("Request to get Expense : {}", id);
        return expenseRepository.findById(id).map(expenseMapper::toDto);
    }

    /**
     * Delete the expense by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Expense : {}", id);
        expenseRepository.deleteById(id);
    }
}
