package com.delivery.service;

import com.delivery.domain.Delivery;
import com.delivery.repository.DeliveryRepository;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.mapper.DeliveryMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Delivery}.
 */
@Service
@Transactional
public class DeliveryService {

    private static final Logger LOG = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryRepository deliveryRepository;

    private final DeliveryMapper deliveryMapper;

    public DeliveryService(DeliveryRepository deliveryRepository, DeliveryMapper deliveryMapper) {
        this.deliveryRepository = deliveryRepository;
        this.deliveryMapper = deliveryMapper;
    }

    /**
     * Save a delivery.
     *
     * @param deliveryDTO the entity to save.
     * @return the persisted entity.
     */
    public DeliveryDTO save(DeliveryDTO deliveryDTO) {
        LOG.debug("Request to save Delivery : {}", deliveryDTO);
        Delivery delivery = deliveryMapper.toEntity(deliveryDTO);
        delivery = deliveryRepository.save(delivery);
        return deliveryMapper.toDto(delivery);
    }

    /**
     * Update a delivery.
     *
     * @param deliveryDTO the entity to save.
     * @return the persisted entity.
     */
    public DeliveryDTO update(DeliveryDTO deliveryDTO) {
        LOG.debug("Request to update Delivery : {}", deliveryDTO);
        Delivery delivery = deliveryMapper.toEntity(deliveryDTO);
        delivery = deliveryRepository.save(delivery);
        return deliveryMapper.toDto(delivery);
    }

    /**
     * Partially update a delivery.
     *
     * @param deliveryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DeliveryDTO> partialUpdate(DeliveryDTO deliveryDTO) {
        LOG.debug("Request to partially update Delivery : {}", deliveryDTO);

        return deliveryRepository
            .findById(deliveryDTO.getId())
            .map(existingDelivery -> {
                deliveryMapper.partialUpdate(existingDelivery, deliveryDTO);

                return existingDelivery;
            })
            .map(deliveryRepository::save)
            .map(deliveryMapper::toDto);
    }

    /**
     * Get one delivery by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DeliveryDTO> findOne(Long id) {
        LOG.debug("Request to get Delivery : {}", id);
        return deliveryRepository.findById(id).map(deliveryMapper::toDto);
    }

    /**
     * Delete the delivery by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Delivery : {}", id);
        deliveryRepository.deleteById(id);
    }
}
