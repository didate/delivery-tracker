package com.delivery.service;

import com.delivery.domain.Delivery;
import com.delivery.domain.Tenant;
import com.delivery.repository.DeliveryRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
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

    private final TenantRepository tenantRepository;

    public DeliveryService(DeliveryRepository deliveryRepository, DeliveryMapper deliveryMapper, TenantRepository tenantRepository) {
        this.deliveryRepository = deliveryRepository;
        this.deliveryMapper = deliveryMapper;
        this.tenantRepository = tenantRepository;
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
        // Auto-set tenant from context for new entities
        if (delivery.getId() == null && delivery.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(delivery::setTenant);
        }
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
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || !deliveryRepository.existsByIdAndTenant_Id(deliveryDTO.getId(), tenantId)) {
            throw new IllegalArgumentException("Entity not found or access denied");
        }
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

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return deliveryRepository
            .findByIdAndTenant_Id(deliveryDTO.getId(), tenantId)
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
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return deliveryRepository.findByIdAndTenant_Id(id, tenantId).map(deliveryMapper::toDto);
    }

    /**
     * Delete the delivery by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Delivery : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            deliveryRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }

    /**
     * Check if a delivery exists by id with tenant filtering.
     *
     * @param id the id of the entity.
     * @return true if the entity exists, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        LOG.debug("Request to check if Delivery exists : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return deliveryRepository.existsByIdAndTenant_Id(id, tenantId);
    }
}
