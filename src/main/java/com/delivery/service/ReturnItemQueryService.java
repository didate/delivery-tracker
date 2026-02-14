package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.ReturnItem;
import com.delivery.repository.ReturnItemRepository;
import com.delivery.service.criteria.ReturnItemCriteria;
import com.delivery.service.dto.ReturnItemDTO;
import com.delivery.service.mapper.ReturnItemMapper;
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
 * Service for executing complex queries for {@link ReturnItem} entities in the database.
 * The main input is a {@link ReturnItemCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ReturnItemDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ReturnItemQueryService extends QueryService<ReturnItem> {

    private static final Logger LOG = LoggerFactory.getLogger(ReturnItemQueryService.class);

    private final ReturnItemRepository returnItemRepository;

    private final ReturnItemMapper returnItemMapper;

    public ReturnItemQueryService(ReturnItemRepository returnItemRepository, ReturnItemMapper returnItemMapper) {
        this.returnItemRepository = returnItemRepository;
        this.returnItemMapper = returnItemMapper;
    }

    /**
     * Return a {@link Page} of {@link ReturnItemDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ReturnItemDTO> findByCriteria(ReturnItemCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ReturnItem> specification = createSpecification(criteria);
        return returnItemRepository.findAll(specification, page).map(returnItemMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ReturnItemCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<ReturnItem> specification = createSpecification(criteria);
        return returnItemRepository.count(specification);
    }

    /**
     * Function to convert {@link ReturnItemCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ReturnItem> createSpecification(ReturnItemCriteria criteria) {
        Specification<ReturnItem> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), ReturnItem_.id),
                buildRangeSpecification(criteria.getQuantity(), ReturnItem_.quantity),
                buildRangeSpecification(criteria.getUnitPrice(), ReturnItem_.unitPrice),
                buildSpecification(criteria.getProductReturnId(), root ->
                    root.join(ReturnItem_.productReturn, JoinType.LEFT).get(ProductReturn_.id)
                ),
                buildSpecification(criteria.getProductId(), root -> root.join(ReturnItem_.product, JoinType.LEFT).get(Product_.id))
            );
        }
        return specification;
    }
}
