package com.delivery.service;

import com.delivery.domain.PriceHistory;
import com.delivery.domain.Product;
import com.delivery.repository.PriceHistoryRepository;
import com.delivery.service.dto.PriceHistoryDTO;
import com.delivery.service.mapper.PriceHistoryMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.PriceHistory}.
 */
@Service
@Transactional
public class PriceHistoryService {

    private static final Logger LOG = LoggerFactory.getLogger(PriceHistoryService.class);

    private final PriceHistoryRepository priceHistoryRepository;

    private final PriceHistoryMapper priceHistoryMapper;

    public PriceHistoryService(PriceHistoryRepository priceHistoryRepository, PriceHistoryMapper priceHistoryMapper) {
        this.priceHistoryRepository = priceHistoryRepository;
        this.priceHistoryMapper = priceHistoryMapper;
    }

    /**
     * Save a priceHistory.
     * When creating a new price history, sets the endDate of the previous active price history.
     *
     * @param priceHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public PriceHistoryDTO save(PriceHistoryDTO priceHistoryDTO) {
        LOG.debug("Request to save PriceHistory : {}", priceHistoryDTO);
        PriceHistory priceHistory = priceHistoryMapper.toEntity(priceHistoryDTO);

        // If this is a new price history (not an update), close the previous active price history
        if (priceHistoryDTO.getId() == null && priceHistory.getProduct() != null) {
            closeCurrentActivePriceHistory(priceHistory.getProduct().getId(), priceHistory.getEffectiveDate());
        }

        priceHistory = priceHistoryRepository.save(priceHistory);
        return priceHistoryMapper.toDto(priceHistory);
    }

    /**
     * Update a priceHistory.
     *
     * @param priceHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public PriceHistoryDTO update(PriceHistoryDTO priceHistoryDTO) {
        LOG.debug("Request to update PriceHistory : {}", priceHistoryDTO);
        PriceHistory priceHistory = priceHistoryMapper.toEntity(priceHistoryDTO);
        priceHistory = priceHistoryRepository.save(priceHistory);
        return priceHistoryMapper.toDto(priceHistory);
    }

    /**
     * Partially update a priceHistory.
     *
     * @param priceHistoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PriceHistoryDTO> partialUpdate(PriceHistoryDTO priceHistoryDTO) {
        LOG.debug("Request to partially update PriceHistory : {}", priceHistoryDTO);

        return priceHistoryRepository
            .findById(priceHistoryDTO.getId())
            .map(existingPriceHistory -> {
                priceHistoryMapper.partialUpdate(existingPriceHistory, priceHistoryDTO);

                return existingPriceHistory;
            })
            .map(priceHistoryRepository::save)
            .map(priceHistoryMapper::toDto);
    }

    /**
     * Get one priceHistory by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PriceHistoryDTO> findOne(Long id) {
        LOG.debug("Request to get PriceHistory : {}", id);
        return priceHistoryRepository.findById(id).map(priceHistoryMapper::toDto);
    }

    /**
     * Delete the priceHistory by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete PriceHistory : {}", id);
        priceHistoryRepository.deleteById(id);
    }

    /**
     * Create a price history record for a product.
     * This method logs the old price of a product when the price changes.
     * It also closes the previous active price history by setting its endDate.
     *
     * @param product the product entity with the old price to log.
     * @param oldPrice the old price to record in the history.
     * @return the persisted PriceHistory entity.
     */
    public PriceHistory createPriceHistoryRecord(Product product, BigDecimal oldPrice) {
        LOG.debug("Request to create PriceHistory record for Product : {} with old price : {}", product.getId(), oldPrice);

        // Close the current active price history before creating a new one
        closeCurrentActivePriceHistory(product.getId(), LocalDate.now());

        PriceHistory priceHistory = new PriceHistory();
        priceHistory.setProduct(product);
        priceHistory.setPrice(oldPrice);
        priceHistory.setEffectiveDate(LocalDate.now());
        return priceHistoryRepository.save(priceHistory);
    }

    /**
     * Close the current active price history for a product by setting its endDate.
     *
     * @param productId the product id
     * @param endDate the end date to set (typically the day before the new price becomes effective)
     */
    private void closeCurrentActivePriceHistory(Long productId, LocalDate endDate) {
        priceHistoryRepository
            .findCurrentActiveByProductId(productId)
            .ifPresent(currentActive -> {
                LOG.debug("Closing previous active price history {} for product {}", currentActive.getId(), productId);
                // Set end date to the day before the new price becomes effective
                currentActive.setEndDate(endDate.minusDays(1));
                priceHistoryRepository.save(currentActive);
            });
    }
}
