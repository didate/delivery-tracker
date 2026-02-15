package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.Delivery;
import com.delivery.repository.DeliveryRepository;
import com.delivery.security.TenantSpecifications;
import com.delivery.service.criteria.DeliveryCriteria;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.mapper.DeliveryMapper;
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
 * Service for executing complex queries for {@link Delivery} entities in the database.
 * The main input is a {@link DeliveryCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link DeliveryDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class DeliveryQueryService extends QueryService<Delivery> {

    private static final Logger LOG = LoggerFactory.getLogger(DeliveryQueryService.class);

    private final DeliveryRepository deliveryRepository;

    private final DeliveryMapper deliveryMapper;

    public DeliveryQueryService(DeliveryRepository deliveryRepository, DeliveryMapper deliveryMapper) {
        this.deliveryRepository = deliveryRepository;
        this.deliveryMapper = deliveryMapper;
    }

    /**
     * Return a {@link Page} of {@link DeliveryDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<DeliveryDTO> findByCriteria(DeliveryCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Delivery> specification = createSpecification(criteria);
        return deliveryRepository.findAll(specification, page).map(deliveryMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(DeliveryCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Delivery> specification = createSpecification(criteria);
        return deliveryRepository.count(specification);
    }

    /**
     * Function to convert {@link DeliveryCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Delivery> createSpecification(DeliveryCriteria criteria) {
        Specification<Delivery> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Delivery_.id),
                buildRangeSpecification(criteria.getDeliveryDate(), Delivery_.deliveryDate),
                buildSpecification(criteria.getStatus(), Delivery_.status),
                buildRangeSpecification(criteria.getTotalAmount(), Delivery_.totalAmount),
                buildRangeSpecification(criteria.getPaidAmount(), Delivery_.paidAmount),
                buildSpecification(criteria.getTenantId(), root -> root.join(Delivery_.tenant, JoinType.LEFT).get(Tenant_.id)),
                buildSpecification(criteria.getCustomerId(), root -> root.join(Delivery_.customer, JoinType.LEFT).get(Customer_.id)),
                buildSpecification(criteria.getDriverId(), root -> root.join(Delivery_.driver, JoinType.LEFT).get(Driver_.id))
            );
        }
        // Apply automatic tenant filtering for non-ADMIN users
        return TenantSpecifications.withTenantFilter(specification, Delivery_.tenant, Tenant_.id);
    }
}
