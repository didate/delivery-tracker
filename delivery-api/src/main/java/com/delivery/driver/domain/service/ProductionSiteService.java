package com.delivery.driver.domain.service;

import com.delivery.driver.domain.entity.ProductionSite;
import com.delivery.driver.domain.repository.ProductionSiteRepository;
import com.delivery.shared.exception.DuplicateResourceException;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductionSiteService {

    private final ProductionSiteRepository productionSiteRepository;

    @Transactional
    public ProductionSite createProductionSite(String name, String address, BigDecimal latitude, BigDecimal longitude) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (productionSiteRepository.existsByTenantIdAndName(tenantId, name)) {
            throw new DuplicateResourceException("ProductionSite", "name", name);
        }

        ProductionSite productionSite = ProductionSite.builder()
                .name(name)
                .address(address)
                .latitude(latitude)
                .longitude(longitude)
                .active(true)
                .build();

        return productionSiteRepository.save(productionSite);
    }

    @Transactional
    public ProductionSite updateProductionSite(UUID id, String name, String address, BigDecimal latitude, BigDecimal longitude) {
        UUID tenantId = TenantContext.getCurrentTenant();
        ProductionSite productionSite = getProductionSiteById(id);

        if (name != null && !name.equals(productionSite.getName())) {
            if (productionSiteRepository.existsByTenantIdAndNameAndIdNot(tenantId, name, id)) {
                throw new DuplicateResourceException("ProductionSite", "name", name);
            }
            productionSite.setName(name);
        }

        if (address != null) {
            productionSite.setAddress(address);
        }

        if (latitude != null) {
            productionSite.setLatitude(latitude);
        }

        if (longitude != null) {
            productionSite.setLongitude(longitude);
        }

        return productionSiteRepository.save(productionSite);
    }

    public ProductionSite getProductionSiteById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productionSiteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductionSite", "id", id));
    }

    public Page<ProductionSite> listProductionSites(Boolean active, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (active != null) {
            return productionSiteRepository.findByTenantIdAndActive(tenantId, active, pageable);
        }

        return productionSiteRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional
    public void deactivateProductionSite(UUID id) {
        ProductionSite productionSite = getProductionSiteById(id);
        productionSite.setActive(false);
        productionSiteRepository.save(productionSite);
    }

    @Transactional
    public void activateProductionSite(UUID id) {
        ProductionSite productionSite = getProductionSiteById(id);
        productionSite.setActive(true);
        productionSiteRepository.save(productionSite);
    }
}
