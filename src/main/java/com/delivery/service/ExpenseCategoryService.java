package com.delivery.service;

import com.delivery.domain.ExpenseCategory;
import com.delivery.domain.Tenant;
import com.delivery.repository.ExpenseCategoryRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.ExpenseCategoryDTO;
import com.delivery.service.mapper.ExpenseCategoryMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.ExpenseCategory}.
 */
@Service
@Transactional
public class ExpenseCategoryService {

    private static final Logger LOG = LoggerFactory.getLogger(ExpenseCategoryService.class);

    private final ExpenseCategoryRepository expenseCategoryRepository;

    private final ExpenseCategoryMapper expenseCategoryMapper;

    private final TenantRepository tenantRepository;

    public ExpenseCategoryService(
        ExpenseCategoryRepository expenseCategoryRepository,
        ExpenseCategoryMapper expenseCategoryMapper,
        TenantRepository tenantRepository
    ) {
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.expenseCategoryMapper = expenseCategoryMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a expenseCategory.
     *
     * @param expenseCategoryDTO the entity to save.
     * @return the persisted entity.
     */
    public ExpenseCategoryDTO save(ExpenseCategoryDTO expenseCategoryDTO) {
        LOG.debug("Request to save ExpenseCategory : {}", expenseCategoryDTO);
        ExpenseCategory expenseCategory = expenseCategoryMapper.toEntity(expenseCategoryDTO);
        // Auto-set tenant from context for new entities
        if (expenseCategory.getId() == null && expenseCategory.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(expenseCategory::setTenant);
        }
        expenseCategory = expenseCategoryRepository.save(expenseCategory);
        return expenseCategoryMapper.toDto(expenseCategory);
    }

    /**
     * Update a expenseCategory.
     *
     * @param expenseCategoryDTO the entity to save.
     * @return the persisted entity.
     */
    public ExpenseCategoryDTO update(ExpenseCategoryDTO expenseCategoryDTO) {
        LOG.debug("Request to update ExpenseCategory : {}", expenseCategoryDTO);
        ExpenseCategory expenseCategory = expenseCategoryMapper.toEntity(expenseCategoryDTO);
        expenseCategory = expenseCategoryRepository.save(expenseCategory);
        return expenseCategoryMapper.toDto(expenseCategory);
    }

    /**
     * Partially update a expenseCategory.
     *
     * @param expenseCategoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ExpenseCategoryDTO> partialUpdate(ExpenseCategoryDTO expenseCategoryDTO) {
        LOG.debug("Request to partially update ExpenseCategory : {}", expenseCategoryDTO);

        return expenseCategoryRepository
            .findById(expenseCategoryDTO.getId())
            .map(existingExpenseCategory -> {
                expenseCategoryMapper.partialUpdate(existingExpenseCategory, expenseCategoryDTO);

                return existingExpenseCategory;
            })
            .map(expenseCategoryRepository::save)
            .map(expenseCategoryMapper::toDto);
    }

    /**
     * Get one expenseCategory by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseCategoryDTO> findOne(Long id) {
        LOG.debug("Request to get ExpenseCategory : {}", id);
        return expenseCategoryRepository.findById(id).map(expenseCategoryMapper::toDto);
    }

    /**
     * Delete the expenseCategory by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ExpenseCategory : {}", id);
        expenseCategoryRepository.deleteById(id);
    }
}
