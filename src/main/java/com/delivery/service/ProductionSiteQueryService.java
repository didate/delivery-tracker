package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.ProductionSite;
import com.delivery.repository.ProductionSiteRepository;
import com.delivery.security.TenantSpecifications;
import com.delivery.service.criteria.ProductionSiteCriteria;
import com.delivery.service.dto.ProductionSiteDTO;
import com.delivery.service.mapper.ProductionSiteMapper;
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
 * Service for executing complex queries for {@link ProductionSite} entities in the database.
 * The main input is a {@link ProductionSiteCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ProductionSiteDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ProductionSiteQueryService extends QueryService<ProductionSite> {

    private static final Logger LOG = LoggerFactory.getLogger(ProductionSiteQueryService.class);

    private final ProductionSiteRepository productionSiteRepository;

    private final ProductionSiteMapper productionSiteMapper;

    public ProductionSiteQueryService(ProductionSiteRepository productionSiteRepository, ProductionSiteMapper productionSiteMapper) {
        this.productionSiteRepository = productionSiteRepository;
        this.productionSiteMapper = productionSiteMapper;
    }

    /**
     * Return a {@link Page} of {@link ProductionSiteDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ProductionSiteDTO> findByCriteria(ProductionSiteCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ProductionSite> specification = createSpecification(criteria);
        return productionSiteRepository.findAll(specification, page).map(productionSiteMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ProductionSiteCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<ProductionSite> specification = createSpecification(criteria);
        return productionSiteRepository.count(specification);
    }

    /**
     * Function to convert {@link ProductionSiteCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ProductionSite> createSpecification(ProductionSiteCriteria criteria) {
        Specification<ProductionSite> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), ProductionSite_.id),
                buildStringSpecification(criteria.getCode(), ProductionSite_.code),
                buildStringSpecification(criteria.getName(), ProductionSite_.name),
                buildStringSpecification(criteria.getPhone(), ProductionSite_.phone),
                buildSpecification(criteria.getActive(), ProductionSite_.active),
                buildSpecification(criteria.getTenantId(), root -> root.join(ProductionSite_.tenant, JoinType.LEFT).get(Tenant_.id))
            );
        }
        // Apply automatic tenant filtering for non-ADMIN users
        return TenantSpecifications.withTenantFilter(specification, ProductionSite_.tenant, Tenant_.id);
    }
}
