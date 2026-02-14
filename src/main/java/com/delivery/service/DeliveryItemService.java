package com.delivery.service;

import com.delivery.domain.DeliveryItem;
import com.delivery.repository.DeliveryItemRepository;
import com.delivery.service.dto.DeliveryItemDTO;
import com.delivery.service.mapper.DeliveryItemMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.DeliveryItem}.
 */
@Service
@Transactional
public class DeliveryItemService {

    private static final Logger LOG = LoggerFactory.getLogger(DeliveryItemService.class);

    private final DeliveryItemRepository deliveryItemRepository;

    private final DeliveryItemMapper deliveryItemMapper;

    public DeliveryItemService(DeliveryItemRepository deliveryItemRepository, DeliveryItemMapper deliveryItemMapper) {
        this.deliveryItemRepository = deliveryItemRepository;
        this.deliveryItemMapper = deliveryItemMapper;
    }

    /**
     * Save a deliveryItem.
     *
     * @param deliveryItemDTO the entity to save.
     * @return the persisted entity.
     */
    public DeliveryItemDTO save(DeliveryItemDTO deliveryItemDTO) {
        LOG.debug("Request to save DeliveryItem : {}", deliveryItemDTO);
        DeliveryItem deliveryItem = deliveryItemMapper.toEntity(deliveryItemDTO);
        deliveryItem = deliveryItemRepository.save(deliveryItem);
        return deliveryItemMapper.toDto(deliveryItem);
    }

    /**
     * Update a deliveryItem.
     *
     * @param deliveryItemDTO the entity to save.
     * @return the persisted entity.
     */
    public DeliveryItemDTO update(DeliveryItemDTO deliveryItemDTO) {
        LOG.debug("Request to update DeliveryItem : {}", deliveryItemDTO);
        DeliveryItem deliveryItem = deliveryItemMapper.toEntity(deliveryItemDTO);
        deliveryItem = deliveryItemRepository.save(deliveryItem);
        return deliveryItemMapper.toDto(deliveryItem);
    }

    /**
     * Partially update a deliveryItem.
     *
     * @param deliveryItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DeliveryItemDTO> partialUpdate(DeliveryItemDTO deliveryItemDTO) {
        LOG.debug("Request to partially update DeliveryItem : {}", deliveryItemDTO);

        return deliveryItemRepository
            .findById(deliveryItemDTO.getId())
            .map(existingDeliveryItem -> {
                deliveryItemMapper.partialUpdate(existingDeliveryItem, deliveryItemDTO);

                return existingDeliveryItem;
            })
            .map(deliveryItemRepository::save)
            .map(deliveryItemMapper::toDto);
    }

    /**
     * Get one deliveryItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DeliveryItemDTO> findOne(Long id) {
        LOG.debug("Request to get DeliveryItem : {}", id);
        return deliveryItemRepository.findById(id).map(deliveryItemMapper::toDto);
    }

    /**
     * Delete the deliveryItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete DeliveryItem : {}", id);
        deliveryItemRepository.deleteById(id);
    }
}
