package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.DeliveryItem;
import com.delivery.repository.DeliveryItemRepository;
import com.delivery.service.criteria.DeliveryItemCriteria;
import com.delivery.service.dto.DeliveryItemDTO;
import com.delivery.service.mapper.DeliveryItemMapper;
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
 * Service for executing complex queries for {@link DeliveryItem} entities in the database.
 * The main input is a {@link DeliveryItemCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link DeliveryItemDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class DeliveryItemQueryService extends QueryService<DeliveryItem> {

    private static final Logger LOG = LoggerFactory.getLogger(DeliveryItemQueryService.class);

    private final DeliveryItemRepository deliveryItemRepository;

    private final DeliveryItemMapper deliveryItemMapper;

    public DeliveryItemQueryService(DeliveryItemRepository deliveryItemRepository, DeliveryItemMapper deliveryItemMapper) {
        this.deliveryItemRepository = deliveryItemRepository;
        this.deliveryItemMapper = deliveryItemMapper;
    }

    /**
     * Return a {@link Page} of {@link DeliveryItemDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<DeliveryItemDTO> findByCriteria(DeliveryItemCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<DeliveryItem> specification = createSpecification(criteria);
        return deliveryItemRepository.findAll(specification, page).map(deliveryItemMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(DeliveryItemCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<DeliveryItem> specification = createSpecification(criteria);
        return deliveryItemRepository.count(specification);
    }

    /**
     * Function to convert {@link DeliveryItemCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<DeliveryItem> createSpecification(DeliveryItemCriteria criteria) {
        Specification<DeliveryItem> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), DeliveryItem_.id),
                buildRangeSpecification(criteria.getQuantity(), DeliveryItem_.quantity),
                buildRangeSpecification(criteria.getUnitPrice(), DeliveryItem_.unitPrice),
                buildRangeSpecification(criteria.getTotalPrice(), DeliveryItem_.totalPrice),
                buildSpecification(criteria.getDeliveryId(), root -> root.join(DeliveryItem_.delivery, JoinType.LEFT).get(Delivery_.id)),
                buildSpecification(criteria.getProductId(), root -> root.join(DeliveryItem_.product, JoinType.LEFT).get(Product_.id))
            );
        }
        return specification;
    }
}
