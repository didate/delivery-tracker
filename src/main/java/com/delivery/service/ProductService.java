package com.delivery.service;

import com.delivery.domain.Product;
import com.delivery.repository.ProductRepository;
import com.delivery.service.dto.ProductDTO;
import com.delivery.service.mapper.ProductMapper;
import com.delivery.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Product}.
 */
@Service
@Transactional
public class ProductService {

    private static final Logger LOG = LoggerFactory.getLogger(ProductService.class);

    private static final String ENTITY_NAME = "product";

    private final ProductRepository productRepository;

    private final ProductMapper productMapper;

    private final PriceHistoryService priceHistoryService;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper, PriceHistoryService priceHistoryService) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.priceHistoryService = priceHistoryService;
    }

    /**
     * Save a product.
     *
     * @param productDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductDTO save(ProductDTO productDTO) {
        LOG.debug("Request to save Product : {}", productDTO);
        validateCodeUniqueness(productDTO.getCode(), productDTO.getId());
        Product product = productMapper.toEntity(productDTO);
        product = productRepository.save(product);
        return productMapper.toDto(product);
    }

    /**
     * Update a product.
     * If the price is changing, automatically logs the old price to price history.
     *
     * @param productDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductDTO update(ProductDTO productDTO) {
        LOG.debug("Request to update Product : {}", productDTO);
        validateCodeUniqueness(productDTO.getCode(), productDTO.getId());

        // Check if price is changing and log old price to history
        Optional<Product> existingProductOpt = productRepository.findById(productDTO.getId());
        if (existingProductOpt.isPresent()) {
            Product existingProduct = existingProductOpt.get();
            BigDecimal oldPrice = existingProduct.getPrice();
            BigDecimal newPrice = productDTO.getPrice();

            // If price has changed, log the old price to price history
            if (oldPrice != null && newPrice != null && oldPrice.compareTo(newPrice) != 0) {
                LOG.debug(
                    "Price changed for Product {} from {} to {}, logging old price to history",
                    productDTO.getId(),
                    oldPrice,
                    newPrice
                );
                priceHistoryService.createPriceHistoryRecord(existingProduct, oldPrice);
            }
        }

        Product product = productMapper.toEntity(productDTO);
        product = productRepository.save(product);
        return productMapper.toDto(product);
    }

    /**
     * Partially update a product.
     * If the price is changing, automatically logs the old price to price history.
     *
     * @param productDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductDTO> partialUpdate(ProductDTO productDTO) {
        LOG.debug("Request to partially update Product : {}", productDTO);

        return productRepository
            .findById(productDTO.getId())
            .map(existingProduct -> {
                BigDecimal oldPrice = existingProduct.getPrice();
                BigDecimal newPrice = productDTO.getPrice();

                // If price is being updated and has changed, log the old price to price history
                if (newPrice != null && oldPrice != null && oldPrice.compareTo(newPrice) != 0) {
                    LOG.debug(
                        "Price changed for Product {} from {} to {}, logging old price to history",
                        productDTO.getId(),
                        oldPrice,
                        newPrice
                    );
                    priceHistoryService.createPriceHistoryRecord(existingProduct, oldPrice);
                }

                productMapper.partialUpdate(existingProduct, productDTO);

                return existingProduct;
            })
            .map(productRepository::save)
            .map(productMapper::toDto);
    }

    /**
     * Get one product by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductDTO> findOne(Long id) {
        LOG.debug("Request to get Product : {}", id);
        return productRepository.findById(id).map(productMapper::toDto);
    }

    /**
     * Delete the product by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Product : {}", id);
        productRepository.deleteById(id);
    }

    private void validateCodeUniqueness(String code, Long productId) {
        Optional<Product> existingProduct = productRepository.findByCode(code);
        if (existingProduct.isPresent() && !existingProduct.get().getId().equals(productId)) {
            throw new BadRequestAlertException("A product with this code already exists", ENTITY_NAME, "codeexists");
        }
    }
}
