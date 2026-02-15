package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.Driver;
import com.delivery.repository.DriverRepository;
import com.delivery.security.TenantSpecifications;
import com.delivery.service.criteria.DriverCriteria;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.mapper.DriverMapper;
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
 * Service for executing complex queries for {@link Driver} entities in the database.
 * The main input is a {@link DriverCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link DriverDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class DriverQueryService extends QueryService<Driver> {

    private static final Logger LOG = LoggerFactory.getLogger(DriverQueryService.class);

    private final DriverRepository driverRepository;

    private final DriverMapper driverMapper;

    public DriverQueryService(DriverRepository driverRepository, DriverMapper driverMapper) {
        this.driverRepository = driverRepository;
        this.driverMapper = driverMapper;
    }

    /**
     * Return a {@link Page} of {@link DriverDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<DriverDTO> findByCriteria(DriverCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Driver> specification = createSpecification(criteria);
        return driverRepository.findAll(specification, page).map(driverMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(DriverCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Driver> specification = createSpecification(criteria);
        return driverRepository.count(specification);
    }

    /**
     * Function to convert {@link DriverCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Driver> createSpecification(DriverCriteria criteria) {
        Specification<Driver> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Driver_.id),
                buildStringSpecification(criteria.getCode(), Driver_.code),
                buildStringSpecification(criteria.getName(), Driver_.name),
                buildStringSpecification(criteria.getPhone(), Driver_.phone),
                buildStringSpecification(criteria.getEmail(), Driver_.email),
                buildStringSpecification(criteria.getLicenseNumber(), Driver_.licenseNumber),
                buildSpecification(criteria.getActive(), Driver_.active),
                buildSpecification(criteria.getTenantId(), root -> root.join(Driver_.tenant, JoinType.LEFT).get(Tenant_.id)),
                buildSpecification(criteria.getVehicleId(), root -> root.join(Driver_.vehicle, JoinType.LEFT).get(Vehicle_.id))
            );
        }
        // Apply automatic tenant filtering for non-ADMIN users
        return TenantSpecifications.withTenantFilter(specification, Driver_.tenant, Tenant_.id);
    }
}
