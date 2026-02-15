package com.delivery.service;

import com.delivery.domain.ProductionSite;
import com.delivery.domain.Tenant;
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
     *
     * @param productionSiteDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductionSiteDTO> partialUpdate(ProductionSiteDTO productionSiteDTO) {
        LOG.debug("Request to partially update ProductionSite : {}", productionSiteDTO);

        return productionSiteRepository
            .findById(productionSiteDTO.getId())
            .map(existingProductionSite -> {
                productionSiteMapper.partialUpdate(existingProductionSite, productionSiteDTO);

                return existingProductionSite;
            })
            .map(productionSiteRepository::save)
            .map(productionSiteMapper::toDto);
    }

    /**
     * Get one productionSite by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductionSiteDTO> findOne(Long id) {
        LOG.debug("Request to get ProductionSite : {}", id);
        return productionSiteRepository.findById(id).map(productionSiteMapper::toDto);
    }

    /**
     * Delete the productionSite by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ProductionSite : {}", id);
        productionSiteRepository.deleteById(id);
    }
}
