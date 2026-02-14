package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.TenantSettings;
import com.delivery.repository.TenantSettingsRepository;
import com.delivery.service.criteria.TenantSettingsCriteria;
import com.delivery.service.dto.TenantSettingsDTO;
import com.delivery.service.mapper.TenantSettingsMapper;
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
 * Service for executing complex queries for {@link TenantSettings} entities in the database.
 * The main input is a {@link TenantSettingsCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link TenantSettingsDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class TenantSettingsQueryService extends QueryService<TenantSettings> {

    private static final Logger LOG = LoggerFactory.getLogger(TenantSettingsQueryService.class);

    private final TenantSettingsRepository tenantSettingsRepository;

    private final TenantSettingsMapper tenantSettingsMapper;

    public TenantSettingsQueryService(TenantSettingsRepository tenantSettingsRepository, TenantSettingsMapper tenantSettingsMapper) {
        this.tenantSettingsRepository = tenantSettingsRepository;
        this.tenantSettingsMapper = tenantSettingsMapper;
    }

    /**
     * Return a {@link Page} of {@link TenantSettingsDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<TenantSettingsDTO> findByCriteria(TenantSettingsCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<TenantSettings> specification = createSpecification(criteria);
        return tenantSettingsRepository.findAll(specification, page).map(tenantSettingsMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(TenantSettingsCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<TenantSettings> specification = createSpecification(criteria);
        return tenantSettingsRepository.count(specification);
    }

    /**
     * Function to convert {@link TenantSettingsCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<TenantSettings> createSpecification(TenantSettingsCriteria criteria) {
        Specification<TenantSettings> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), TenantSettings_.id),
                buildStringSpecification(criteria.getCurrency(), TenantSettings_.currency),
                buildStringSpecification(criteria.getTimezone(), TenantSettings_.timezone),
                buildStringSpecification(criteria.getDateFormat(), TenantSettings_.dateFormat),
                buildStringSpecification(criteria.getLanguage(), TenantSettings_.language),
                buildSpecification(criteria.getTenantId(), root -> root.join(TenantSettings_.tenant, JoinType.LEFT).get(Tenant_.id))
            );
        }
        return specification;
    }
}
