package com.delivery.production.domain.service;

import com.delivery.catalog.domain.entity.Product;
import com.delivery.catalog.domain.repository.ProductRepository;
import com.delivery.driver.domain.entity.ProductionSite;
import com.delivery.driver.domain.repository.ProductionSiteRepository;
import com.delivery.production.domain.entity.Production;
import com.delivery.production.domain.repository.ProductionRepository;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionRepository productionRepository;
    private final ProductionSiteRepository productionSiteRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Production createProduction(UUID productionSiteId, UUID productId, Integer quantity, LocalDate productionDate, String notes) {
        UUID tenantId = TenantContext.getCurrentTenant();

        // Validate production site exists and belongs to tenant
        productionSiteRepository.findByIdAndTenantId(productionSiteId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductionSite", "id", productionSiteId));

        // Validate product exists and belongs to tenant
        productRepository.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Production production = Production.builder()
                .productionSiteId(productionSiteId)
                .productId(productId)
                .quantity(quantity)
                .productionDate(productionDate)
                .notes(notes)
                .build();

        return productionRepository.save(production);
    }

    @Transactional
    public Production updateProduction(UUID id, UUID productionSiteId, UUID productId, Integer quantity, LocalDate productionDate, String notes) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Production production = getById(id);

        if (productionSiteId != null && !productionSiteId.equals(production.getProductionSiteId())) {
            productionSiteRepository.findByIdAndTenantId(productionSiteId, tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("ProductionSite", "id", productionSiteId));
            production.setProductionSiteId(productionSiteId);
        }

        if (productId != null && !productId.equals(production.getProductId())) {
            productRepository.findByIdAndTenantId(productId, tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
            production.setProductId(productId);
        }

        if (quantity != null) {
            production.setQuantity(quantity);
        }

        if (productionDate != null) {
            production.setProductionDate(productionDate);
        }

        if (notes != null) {
            production.setNotes(notes);
        }

        return productionRepository.save(production);
    }

    @Transactional
    public void deleteProduction(UUID id) {
        Production production = getById(id);
        productionRepository.delete(production);
    }

    public Production getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Production", "id", id));
    }

    public Page<Production> listByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Production> listByProductionSite(UUID productionSiteId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionRepository.findByTenantIdAndProductionSiteId(tenantId, productionSiteId, pageable);
    }

    public Page<Production> listByProduct(UUID productId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionRepository.findByTenantIdAndProductId(tenantId, productId, pageable);
    }

    public Page<Production> listByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionRepository.findByTenantIdAndProductionDateBetween(tenantId, startDate, endDate, pageable);
    }

    public Page<Production> listByFilters(UUID productionSiteId, UUID productId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionRepository.findByFilters(tenantId, productionSiteId, productId, startDate, endDate, pageable);
    }

    public List<ProductionSummary> getProductionSummary(UUID productionSiteId, LocalDate startDate, LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Object[]> summaryData = productionRepository.getProductionSummaryByProduct(tenantId, productionSiteId, startDate, endDate);

        // Get product names for the summary
        List<UUID> productIds = summaryData.stream()
                .map(row -> (UUID) row[0])
                .collect(Collectors.toList());

        Map<UUID, String> productNames = productIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> productRepository.findByIdAndTenantId(id, tenantId)
                                .map(Product::getName)
                                .orElse("Unknown Product")
                ));

        return summaryData.stream()
                .map(row -> new ProductionSummary(
                        (UUID) row[0],
                        productNames.get((UUID) row[0]),
                        ((Number) row[1]).longValue()
                ))
                .collect(Collectors.toList());
    }

    public record ProductionSummary(UUID productId, String productName, Long totalQuantity) {
    }
}
