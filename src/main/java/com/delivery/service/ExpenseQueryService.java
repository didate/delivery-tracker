package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.Expense;
import com.delivery.repository.ExpenseRepository;
import com.delivery.service.criteria.ExpenseCriteria;
import com.delivery.service.dto.ExpenseDTO;
import com.delivery.service.mapper.ExpenseMapper;
import jakarta.persistence.criteria.JoinType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Expense} entities in the database.
 * The main input is a {@link ExpenseCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ExpenseDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ExpenseQueryService extends QueryService<Expense> {

    private static final Logger LOG = LoggerFactory.getLogger(ExpenseQueryService.class);

    private final ExpenseRepository expenseRepository;

    private final ExpenseMapper expenseMapper;

    public ExpenseQueryService(ExpenseRepository expenseRepository, ExpenseMapper expenseMapper) {
        this.expenseRepository = expenseRepository;
        this.expenseMapper = expenseMapper;
    }

    /**
     * Return a {@link Page} of {@link ExpenseDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> findByCriteria(ExpenseCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Expense> specification = createSpecification(criteria);
        return expenseRepository.findAll(specification, page).map(expenseMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ExpenseCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Expense> specification = createSpecification(criteria);
        return expenseRepository.count(specification);
    }

    /**
     * Function to convert {@link ExpenseCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Expense> createSpecification(ExpenseCriteria criteria) {
        Specification<Expense> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Expense_.id),
                buildRangeSpecification(criteria.getExpenseDate(), Expense_.expenseDate),
                buildRangeSpecification(criteria.getAmount(), Expense_.amount),
                buildStringSpecification(criteria.getReceiptUrl(), Expense_.receiptUrl),
                buildSpecification(criteria.getTenantId(), root -> root.join(Expense_.tenant, JoinType.LEFT).get(Tenant_.id)),
                buildSpecification(criteria.getCategoryId(), root -> root.join(Expense_.category, JoinType.LEFT).get(ExpenseCategory_.id)),
                buildSpecification(criteria.getDriverId(), root -> root.join(Expense_.driver, JoinType.LEFT).get(Driver_.id))
            );
        }
        return specification;
    }
}
