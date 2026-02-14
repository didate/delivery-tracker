package com.delivery.service;

import com.delivery.domain.*; // for static metamodels
import com.delivery.domain.PriceHistory;
import com.delivery.repository.PriceHistoryRepository;
import com.delivery.service.criteria.PriceHistoryCriteria;
import com.delivery.service.dto.PriceHistoryDTO;
import com.delivery.service.mapper.PriceHistoryMapper;
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
 * Service for executing complex queries for {@link PriceHistory} entities in the database.
 * The main input is a {@link PriceHistoryCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link PriceHistoryDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class PriceHistoryQueryService extends QueryService<PriceHistory> {

    private static final Logger LOG = LoggerFactory.getLogger(PriceHistoryQueryService.class);

    private final PriceHistoryRepository priceHistoryRepository;

    private final PriceHistoryMapper priceHistoryMapper;

    public PriceHistoryQueryService(PriceHistoryRepository priceHistoryRepository, PriceHistoryMapper priceHistoryMapper) {
        this.priceHistoryRepository = priceHistoryRepository;
        this.priceHistoryMapper = priceHistoryMapper;
    }

    /**
     * Return a {@link Page} of {@link PriceHistoryDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<PriceHistoryDTO> findByCriteria(PriceHistoryCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<PriceHistory> specification = createSpecification(criteria);
        return priceHistoryRepository.findAll(specification, page).map(priceHistoryMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(PriceHistoryCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<PriceHistory> specification = createSpecification(criteria);
        return priceHistoryRepository.count(specification);
    }

    /**
     * Function to convert {@link PriceHistoryCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<PriceHistory> createSpecification(PriceHistoryCriteria criteria) {
        Specification<PriceHistory> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), PriceHistory_.id),
                buildRangeSpecification(criteria.getPrice(), PriceHistory_.price),
                buildRangeSpecification(criteria.getEffectiveDate(), PriceHistory_.effectiveDate),
                buildSpecification(criteria.getProductId(), root -> root.join(PriceHistory_.product, JoinType.LEFT).get(Product_.id))
            );
        }
        return specification;
    }
}
