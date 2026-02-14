package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.Production;
import com.delivery.repository.ProductionRepository;
import com.delivery.service.criteria.ProductionCriteria;
import com.delivery.service.dto.ProductionDTO;
import com.delivery.service.mapper.ProductionMapper;
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
 * Service for executing complex queries for {@link Production} entities in the database.
 * The main input is a {@link ProductionCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ProductionDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ProductionQueryService extends QueryService<Production> {

    private static final Logger LOG = LoggerFactory.getLogger(ProductionQueryService.class);

    private final ProductionRepository productionRepository;

    private final ProductionMapper productionMapper;

    public ProductionQueryService(ProductionRepository productionRepository, ProductionMapper productionMapper) {
        this.productionRepository = productionRepository;
        this.productionMapper = productionMapper;
    }

    /**
     * Return a {@link Page} of {@link ProductionDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ProductionDTO> findByCriteria(ProductionCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Production> specification = createSpecification(criteria);
        return productionRepository.findAll(specification, page).map(productionMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ProductionCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Production> specification = createSpecification(criteria);
        return productionRepository.count(specification);
    }

    /**
     * Function to convert {@link ProductionCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Production> createSpecification(ProductionCriteria criteria) {
        Specification<Production> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Production_.id),
                buildRangeSpecification(criteria.getProductionDate(), Production_.productionDate),
                buildRangeSpecification(criteria.getQuantity(), Production_.quantity),
                buildSpecification(criteria.getTenantId(), root -> root.join(Production_.tenant, JoinType.LEFT).get(Tenant_.id)),
                buildSpecification(criteria.getProductId(), root -> root.join(Production_.product, JoinType.LEFT).get(Product_.id)),
                buildSpecification(criteria.getProductionSiteId(), root ->
                    root.join(Production_.productionSite, JoinType.LEFT).get(ProductionSite_.id)
                )
            );
        }
        return specification;
    }
}
