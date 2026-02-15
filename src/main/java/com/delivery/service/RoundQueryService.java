package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.Round;
import com.delivery.repository.RoundRepository;
import com.delivery.security.TenantSpecifications;
import com.delivery.service.criteria.RoundCriteria;
import com.delivery.service.dto.RoundDTO;
import com.delivery.service.mapper.RoundMapper;
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
 * Service for executing complex queries for {@link Round} entities in the database.
 * The main input is a {@link RoundCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link RoundDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class RoundQueryService extends QueryService<Round> {

    private static final Logger LOG = LoggerFactory.getLogger(RoundQueryService.class);

    private final RoundRepository roundRepository;

    private final RoundMapper roundMapper;

    public RoundQueryService(RoundRepository roundRepository, RoundMapper roundMapper) {
        this.roundRepository = roundRepository;
        this.roundMapper = roundMapper;
    }

    /**
     * Return a {@link Page} of {@link RoundDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<RoundDTO> findByCriteria(RoundCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Round> specification = createSpecification(criteria);
        return roundRepository.findAll(specification, page).map(roundMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(RoundCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Round> specification = createSpecification(criteria);
        return roundRepository.count(specification);
    }

    /**
     * Function to convert {@link RoundCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Round> createSpecification(RoundCriteria criteria) {
        Specification<Round> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Round_.id),
                buildStringSpecification(criteria.getName(), Round_.name),
                buildRangeSpecification(criteria.getRoundDate(), Round_.roundDate),
                buildSpecification(criteria.getStatus(), Round_.status),
                buildRangeSpecification(criteria.getStartTime(), Round_.startTime),
                buildRangeSpecification(criteria.getEndTime(), Round_.endTime),
                buildSpecification(criteria.getTenantId(), root -> root.join(Round_.tenant, JoinType.LEFT).get(Tenant_.id)),
                buildSpecification(criteria.getDriverId(), root -> root.join(Round_.driver, JoinType.LEFT).get(Driver_.id))
            );
        }
        // Apply automatic tenant filtering for non-ADMIN users
        return TenantSpecifications.withTenantFilter(specification, Round_.tenant, Tenant_.id);
    }
}
