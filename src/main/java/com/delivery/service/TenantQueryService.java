package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.Tenant;
import com.delivery.repository.TenantRepository;
import com.delivery.service.criteria.TenantCriteria;
import com.delivery.service.dto.TenantDTO;
import com.delivery.service.mapper.TenantMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Tenant} entities in the database.
 * The main input is a {@link TenantCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link TenantDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class TenantQueryService extends QueryService<Tenant> {

    private static final Logger LOG = LoggerFactory.getLogger(TenantQueryService.class);

    private final TenantRepository tenantRepository;

    private final TenantMapper tenantMapper;

    public TenantQueryService(TenantRepository tenantRepository, TenantMapper tenantMapper) {
        this.tenantRepository = tenantRepository;
        this.tenantMapper = tenantMapper;
    }

    /**
     * Return a {@link Page} of {@link TenantDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<TenantDTO> findByCriteria(TenantCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Tenant> specification = createSpecification(criteria);
        return tenantRepository.findAll(specification, page).map(tenantMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(TenantCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Tenant> specification = createSpecification(criteria);
        return tenantRepository.count(specification);
    }

    /**
     * Function to convert {@link TenantCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Tenant> createSpecification(TenantCriteria criteria) {
        Specification<Tenant> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Tenant_.id),
                buildStringSpecification(criteria.getCode(), Tenant_.code),
                buildStringSpecification(criteria.getName(), Tenant_.name),
                buildStringSpecification(criteria.getEmail(), Tenant_.email),
                buildStringSpecification(criteria.getPhone(), Tenant_.phone),
                buildStringSpecification(criteria.getLogoUrl(), Tenant_.logoUrl),
                buildSpecification(criteria.getActive(), Tenant_.active)
            );
        }
        return specification;
    }
}
