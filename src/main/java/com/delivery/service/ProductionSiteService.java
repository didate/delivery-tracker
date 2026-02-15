package com.delivery.service;

import com.delivery.domain.ProductionSite;
import com.delivery.repository.ProductionSiteRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.ProductionSiteDTO;
import com.delivery.service.mapper.ProductionSiteMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.ProductionSite}.
 */
@Service
@Transactional
public class ProductionSiteService {

    private static final Logger LOG = LoggerFactory.getLogger(ProductionSiteService.class);

    private final ProductionSiteRepository productionSiteRepository;

    private final ProductionSiteMapper productionSiteMapper;

    private final TenantRepository tenantRepository;

    public ProductionSiteService(
        ProductionSiteRepository productionSiteRepository,
        ProductionSiteMapper productionSiteMapper,
        TenantRepository tenantRepository
    ) {
        this.productionSiteRepository = productionSiteRepository;
        this.productionSiteMapper = productionSiteMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a productionSite.
     *
     * @param productionSiteDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductionSiteDTO save(ProductionSiteDTO productionSiteDTO) {
        LOG.debug("Request to save ProductionSite : {}", productionSiteDTO);
        ProductionSite productionSite = productionSiteMapper.toEntity(productionSiteDTO);
        // Auto-set tenant from context for new entities
        if (productionSite.getId() == null && productionSite.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(productionSite::setTenant);
        }
        productionSite = productionSiteRepository.save(productionSite);
        return productionSiteMapper.toDto(productionSite);
    }

    /**
     * Update a productionSite.
     *
     * @param productionSiteDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductionSiteDTO update(ProductionSiteDTO productionSiteDTO) {
        LOG.debug("Request to update ProductionSite : {}", productionSiteDTO);
        ProductionSite productionSite = productionSiteMapper.toEntity(productionSiteDTO);
        productionSite = productionSiteRepository.save(productionSite);
        return productionSiteMapper.toDto(productionSite);
    }

    /**
     * Partially update a productionSite.
     * Users can only update production sites from their own tenant.
     *
     * @param productionSiteDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductionSiteDTO> partialUpdate(ProductionSiteDTO productionSiteDTO) {
        LOG.debug("Request to partially update ProductionSite : {}", productionSiteDTO);

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return productionSiteRepository
            .findByIdAndTenant_Id(productionSiteDTO.getId(), tenantId)
            .map(existingProductionSite -> {
                productionSiteMapper.partialUpdate(existingProductionSite, productionSiteDTO);
                return existingProductionSite;
            })
            .map(productionSiteRepository::save)
            .map(productionSiteMapper::toDto);
    }

    /**
     * Get one productionSite by id.
     * Users can only access production sites from their own tenant.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductionSiteDTO> findOne(Long id) {
        LOG.debug("Request to get ProductionSite : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return productionSiteRepository.findByIdAndTenant_Id(id, tenantId).map(productionSiteMapper::toDto);
    }

    /**
     * Delete the productionSite by id.
     * Users can only delete production sites from their own tenant.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ProductionSite : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            productionSiteRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }

    /**
     * Check if a productionSite exists by id within the current tenant.
     *
     * @param id the id of the entity.
     * @return true if the entity exists in the current tenant, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return productionSiteRepository.existsByIdAndTenant_Id(id, tenantId);
    }
}
