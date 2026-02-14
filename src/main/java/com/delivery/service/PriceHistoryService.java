package com.delivery.service;

import com.delivery.domain.PriceHistory;
import com.delivery.repository.PriceHistoryRepository;
import com.delivery.service.dto.PriceHistoryDTO;
import com.delivery.service.mapper.PriceHistoryMapper;
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
     *
     * @param priceHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public PriceHistoryDTO save(PriceHistoryDTO priceHistoryDTO) {
        LOG.debug("Request to save PriceHistory : {}", priceHistoryDTO);
        PriceHistory priceHistory = priceHistoryMapper.toEntity(priceHistoryDTO);
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
}
