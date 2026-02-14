package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.ExpenseCategory;
import com.delivery.repository.ExpenseCategoryRepository;
import com.delivery.service.criteria.ExpenseCategoryCriteria;
import com.delivery.service.dto.ExpenseCategoryDTO;
import com.delivery.service.mapper.ExpenseCategoryMapper;
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
 * Service for executing complex queries for {@link ExpenseCategory} entities in the database.
 * The main input is a {@link ExpenseCategoryCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ExpenseCategoryDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ExpenseCategoryQueryService extends QueryService<ExpenseCategory> {

    private static final Logger LOG = LoggerFactory.getLogger(ExpenseCategoryQueryService.class);

    private final ExpenseCategoryRepository expenseCategoryRepository;

    private final ExpenseCategoryMapper expenseCategoryMapper;

    public ExpenseCategoryQueryService(ExpenseCategoryRepository expenseCategoryRepository, ExpenseCategoryMapper expenseCategoryMapper) {
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.expenseCategoryMapper = expenseCategoryMapper;
    }

    /**
     * Return a {@link Page} of {@link ExpenseCategoryDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ExpenseCategoryDTO> findByCriteria(ExpenseCategoryCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ExpenseCategory> specification = createSpecification(criteria);
        return expenseCategoryRepository.findAll(specification, page).map(expenseCategoryMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ExpenseCategoryCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<ExpenseCategory> specification = createSpecification(criteria);
        return expenseCategoryRepository.count(specification);
    }

    /**
     * Function to convert {@link ExpenseCategoryCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ExpenseCategory> createSpecification(ExpenseCategoryCriteria criteria) {
        Specification<ExpenseCategory> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), ExpenseCategory_.id),
                buildStringSpecification(criteria.getCode(), ExpenseCategory_.code),
                buildStringSpecification(criteria.getName(), ExpenseCategory_.name),
                buildSpecification(criteria.getActive(), ExpenseCategory_.active),
                buildSpecification(criteria.getTenantId(), root -> root.join(ExpenseCategory_.tenant, JoinType.LEFT).get(Tenant_.id))
            );
        }
        return specification;
    }
}
