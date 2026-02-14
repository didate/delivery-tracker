package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.ProductReturn;
import com.delivery.repository.ProductReturnRepository;
import com.delivery.service.criteria.ProductReturnCriteria;
import com.delivery.service.dto.ProductReturnDTO;
import com.delivery.service.mapper.ProductReturnMapper;
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
 * Service for executing complex queries for {@link ProductReturn} entities in the database.
 * The main input is a {@link ProductReturnCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ProductReturnDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ProductReturnQueryService extends QueryService<ProductReturn> {

    private static final Logger LOG = LoggerFactory.getLogger(ProductReturnQueryService.class);

    private final ProductReturnRepository productReturnRepository;

    private final ProductReturnMapper productReturnMapper;

    public ProductReturnQueryService(ProductReturnRepository productReturnRepository, ProductReturnMapper productReturnMapper) {
        this.productReturnRepository = productReturnRepository;
        this.productReturnMapper = productReturnMapper;
    }

    /**
     * Return a {@link Page} of {@link ProductReturnDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ProductReturnDTO> findByCriteria(ProductReturnCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ProductReturn> specification = createSpecification(criteria);
        return productReturnRepository.findAll(specification, page).map(productReturnMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ProductReturnCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<ProductReturn> specification = createSpecification(criteria);
        return productReturnRepository.count(specification);
    }

    /**
     * Function to convert {@link ProductReturnCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ProductReturn> createSpecification(ProductReturnCriteria criteria) {
        Specification<ProductReturn> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), ProductReturn_.id),
                buildRangeSpecification(criteria.getReturnDate(), ProductReturn_.returnDate),
                buildSpecification(criteria.getReason(), ProductReturn_.reason),
                buildSpecification(criteria.getTenantId(), root -> root.join(ProductReturn_.tenant, JoinType.LEFT).get(Tenant_.id)),
                buildSpecification(criteria.getCustomerId(), root -> root.join(ProductReturn_.customer, JoinType.LEFT).get(Customer_.id)),
                buildSpecification(criteria.getDeliveryId(), root -> root.join(ProductReturn_.delivery, JoinType.LEFT).get(Delivery_.id))
            );
        }
        return specification;
    }
}
