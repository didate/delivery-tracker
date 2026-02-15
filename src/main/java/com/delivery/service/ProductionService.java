package com.delivery.service;

import com.delivery.domain.Production;
import com.delivery.domain.Tenant;
import com.delivery.repository.ProductionRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.ProductionDTO;
import com.delivery.service.mapper.ProductionMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Production}.
 */
@Service
@Transactional
public class ProductionService {

    private static final Logger LOG = LoggerFactory.getLogger(ProductionService.class);

    private final ProductionRepository productionRepository;

    private final ProductionMapper productionMapper;

    private final TenantRepository tenantRepository;

    public ProductionService(
        ProductionRepository productionRepository,
        ProductionMapper productionMapper,
        TenantRepository tenantRepository
    ) {
        this.productionRepository = productionRepository;
        this.productionMapper = productionMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a production.
     *
     * @param productionDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductionDTO save(ProductionDTO productionDTO) {
        LOG.debug("Request to save Production : {}", productionDTO);
        Production production = productionMapper.toEntity(productionDTO);
        // Auto-set tenant from context for new entities
        if (production.getId() == null && production.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(production::setTenant);
        }
        production = productionRepository.save(production);
        return productionMapper.toDto(production);
    }

    /**
     * Update a production.
     *
     * @param productionDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductionDTO update(ProductionDTO productionDTO) {
        LOG.debug("Request to update Production : {}", productionDTO);
        Production production = productionMapper.toEntity(productionDTO);
        production = productionRepository.save(production);
        return productionMapper.toDto(production);
    }

    /**
     * Partially update a production.
     *
     * @param productionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductionDTO> partialUpdate(ProductionDTO productionDTO) {
        LOG.debug("Request to partially update Production : {}", productionDTO);

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return productionRepository
            .findByIdAndTenant_Id(productionDTO.getId(), tenantId)
            .map(existingProduction -> {
                productionMapper.partialUpdate(existingProduction, productionDTO);

                return existingProduction;
            })
            .map(productionRepository::save)
            .map(productionMapper::toDto);
    }

    /**
     * Get one production by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductionDTO> findOne(Long id) {
        LOG.debug("Request to get Production : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return productionRepository.findByIdAndTenant_Id(id, tenantId).map(productionMapper::toDto);
    }

    /**
     * Delete the production by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Production : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            productionRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }

    /**
     * Check if a production exists by id within the current tenant.
     *
     * @param id the id of the entity.
     * @return true if the entity exists, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return productionRepository.existsByIdAndTenant_Id(id, tenantId);
    }
}
