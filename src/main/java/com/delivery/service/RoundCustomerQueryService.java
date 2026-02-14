package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.RoundCustomer;
import com.delivery.repository.RoundCustomerRepository;
import com.delivery.service.criteria.RoundCustomerCriteria;
import com.delivery.service.dto.RoundCustomerDTO;
import com.delivery.service.mapper.RoundCustomerMapper;
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
 * Service for executing complex queries for {@link RoundCustomer} entities in the database.
 * The main input is a {@link RoundCustomerCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link RoundCustomerDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class RoundCustomerQueryService extends QueryService<RoundCustomer> {

    private static final Logger LOG = LoggerFactory.getLogger(RoundCustomerQueryService.class);

    private final RoundCustomerRepository roundCustomerRepository;

    private final RoundCustomerMapper roundCustomerMapper;

    public RoundCustomerQueryService(RoundCustomerRepository roundCustomerRepository, RoundCustomerMapper roundCustomerMapper) {
        this.roundCustomerRepository = roundCustomerRepository;
        this.roundCustomerMapper = roundCustomerMapper;
    }

    /**
     * Return a {@link Page} of {@link RoundCustomerDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<RoundCustomerDTO> findByCriteria(RoundCustomerCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<RoundCustomer> specification = createSpecification(criteria);
        return roundCustomerRepository.findAll(specification, page).map(roundCustomerMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(RoundCustomerCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<RoundCustomer> specification = createSpecification(criteria);
        return roundCustomerRepository.count(specification);
    }

    /**
     * Function to convert {@link RoundCustomerCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<RoundCustomer> createSpecification(RoundCustomerCriteria criteria) {
        Specification<RoundCustomer> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), RoundCustomer_.id),
                buildRangeSpecification(criteria.getSequenceOrder(), RoundCustomer_.sequenceOrder),
                buildSpecification(criteria.getVisited(), RoundCustomer_.visited),
                buildRangeSpecification(criteria.getVisitTime(), RoundCustomer_.visitTime),
                buildSpecification(criteria.getRoundId(), root -> root.join(RoundCustomer_.round, JoinType.LEFT).get(Round_.id)),
                buildSpecification(criteria.getCustomerId(), root -> root.join(RoundCustomer_.customer, JoinType.LEFT).get(Customer_.id))
            );
        }
        return specification;
    }
}
