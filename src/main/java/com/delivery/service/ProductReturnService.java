package com.delivery.service;

import com.delivery.domain.ProductReturn;
import com.delivery.repository.ProductReturnRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.ProductReturnDTO;
import com.delivery.service.mapper.ProductReturnMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.ProductReturn}.
 */
@Service
@Transactional
public class ProductReturnService {

    private static final Logger LOG = LoggerFactory.getLogger(ProductReturnService.class);

    private final ProductReturnRepository productReturnRepository;

    private final ProductReturnMapper productReturnMapper;

    private final TenantRepository tenantRepository;

    public ProductReturnService(
        ProductReturnRepository productReturnRepository,
        ProductReturnMapper productReturnMapper,
        TenantRepository tenantRepository
    ) {
        this.productReturnRepository = productReturnRepository;
        this.productReturnMapper = productReturnMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a productReturn.
     *
     * @param productReturnDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductReturnDTO save(ProductReturnDTO productReturnDTO) {
        LOG.debug("Request to save ProductReturn : {}", productReturnDTO);
        ProductReturn productReturn = productReturnMapper.toEntity(productReturnDTO);
        // Auto-set tenant from context for new entities
        if (productReturn.getId() == null && productReturn.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(productReturn::setTenant);
        }
        productReturn = productReturnRepository.save(productReturn);
        return productReturnMapper.toDto(productReturn);
    }

    /**
     * Update a productReturn.
     *
     * @param productReturnDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductReturnDTO update(ProductReturnDTO productReturnDTO) {
        LOG.debug("Request to update ProductReturn : {}", productReturnDTO);
        // Verify tenant ownership
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || !productReturnRepository.existsByIdAndTenant_Id(productReturnDTO.getId(), tenantId)) {
            throw new IllegalArgumentException("Entity not found or access denied");
        }
        ProductReturn productReturn = productReturnMapper.toEntity(productReturnDTO);
        productReturn = productReturnRepository.save(productReturn);
        return productReturnMapper.toDto(productReturn);
    }

    /**
     * Partially update a productReturn.
     * Users can only update productReturns from their own tenant.
     *
     * @param productReturnDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductReturnDTO> partialUpdate(ProductReturnDTO productReturnDTO) {
        LOG.debug("Request to partially update ProductReturn : {}", productReturnDTO);

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return productReturnRepository
            .findByIdAndTenant_Id(productReturnDTO.getId(), tenantId)
            .map(existingProductReturn -> {
                productReturnMapper.partialUpdate(existingProductReturn, productReturnDTO);
                return existingProductReturn;
            })
            .map(productReturnRepository::save)
            .map(productReturnMapper::toDto);
    }

    /**
     * Get one productReturn by id.
     * Users can only access productReturns from their own tenant.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductReturnDTO> findOne(Long id) {
        LOG.debug("Request to get ProductReturn : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return productReturnRepository.findByIdAndTenant_Id(id, tenantId).map(productReturnMapper::toDto);
    }

    /**
     * Check if a productReturn exists by id.
     * Users can only check productReturns from their own tenant.
     *
     * @param id the id of the entity.
     * @return true if exists, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        LOG.debug("Request to check if ProductReturn exists : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return productReturnRepository.existsByIdAndTenant_Id(id, tenantId);
    }

    /**
     * Delete the productReturn by id.
     * Users can only delete productReturns from their own tenant.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ProductReturn : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            productReturnRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }
}
