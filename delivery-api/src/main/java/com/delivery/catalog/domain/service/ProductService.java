package com.delivery.catalog.domain.service;

import com.delivery.catalog.domain.entity.PriceHistory;
import com.delivery.catalog.domain.entity.Product;
import com.delivery.catalog.domain.repository.PriceHistoryRepository;
import com.delivery.catalog.domain.repository.ProductRepository;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    @Transactional
    public Product createProduct(String name, String description, BigDecimal price) {
        UUID tenantId = TenantContext.getCurrentTenant();
        String code = generateProductCode(tenantId);

        Product product = Product.builder()
                .code(code)
                .name(name)
                .description(description)
                .price(price)
                .active(true)
                .build();

        product = productRepository.save(product);

        createPriceHistoryEntry(product.getId(), tenantId, price);

        return product;
    }

    public Product getProductById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    public Page<Product> listProducts(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Product> listProducts(Boolean active, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (active != null) {
            return productRepository.findByTenantIdAndActive(tenantId, active, pageable);
        }
        return productRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional
    public Product updateProduct(UUID id, String name, String description, BigDecimal price) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Product product = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        boolean priceChanged = price != null && product.getPrice().compareTo(price) != 0;

        if (name != null) {
            product.setName(name);
        }
        if (description != null) {
            product.setDescription(description);
        }
        if (price != null) {
            product.setPrice(price);
        }

        product = productRepository.save(product);

        if (priceChanged) {
            LocalDateTime now = LocalDateTime.now();
            priceHistoryRepository.closeCurrentPrice(product.getId(), tenantId, now);
            createPriceHistoryEntry(product.getId(), tenantId, price);
        }

        return product;
    }

    @Transactional
    public void deactivateProduct(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Product product = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void activateProduct(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Product product = productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setActive(true);
        productRepository.save(product);
    }

    public List<PriceHistory> getPriceHistory(UUID productId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        // Verify product exists and belongs to tenant
        productRepository.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return priceHistoryRepository.findByProductIdAndTenantIdOrderByStartDateDesc(productId, tenantId);
    }

    private String generateProductCode(UUID tenantId) {
        return productRepository.findLastCodeByTenantId(tenantId)
                .map(lastCode -> {
                    String numericPart = lastCode.replace("PRD-", "");
                    int nextNumber = Integer.parseInt(numericPart) + 1;
                    return String.format("PRD-%04d", nextNumber);
                })
                .orElse("PRD-0001");
    }

    private void createPriceHistoryEntry(UUID productId, UUID tenantId, BigDecimal price) {
        PriceHistory priceHistory = PriceHistory.builder()
                .productId(productId)
                .price(price)
                .startDate(LocalDateTime.now())
                .build();
        priceHistory.setTenantId(tenantId);
        priceHistoryRepository.save(priceHistory);
    }
}
