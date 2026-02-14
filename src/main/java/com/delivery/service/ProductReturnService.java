package com.delivery.service;

import com.delivery.domain.ProductReturn;
import com.delivery.repository.ProductReturnRepository;
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

    public ProductReturnService(ProductReturnRepository productReturnRepository, ProductReturnMapper productReturnMapper) {
        this.productReturnRepository = productReturnRepository;
        this.productReturnMapper = productReturnMapper;
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
        ProductReturn productReturn = productReturnMapper.toEntity(productReturnDTO);
        productReturn = productReturnRepository.save(productReturn);
        return productReturnMapper.toDto(productReturn);
    }

    /**
     * Partially update a productReturn.
     *
     * @param productReturnDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductReturnDTO> partialUpdate(ProductReturnDTO productReturnDTO) {
        LOG.debug("Request to partially update ProductReturn : {}", productReturnDTO);

        return productReturnRepository
            .findById(productReturnDTO.getId())
            .map(existingProductReturn -> {
                productReturnMapper.partialUpdate(existingProductReturn, productReturnDTO);

                return existingProductReturn;
            })
            .map(productReturnRepository::save)
            .map(productReturnMapper::toDto);
    }

    /**
     * Get one productReturn by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductReturnDTO> findOne(Long id) {
        LOG.debug("Request to get ProductReturn : {}", id);
        return productReturnRepository.findById(id).map(productReturnMapper::toDto);
    }

    /**
     * Delete the productReturn by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ProductReturn : {}", id);
        productReturnRepository.deleteById(id);
    }
}
