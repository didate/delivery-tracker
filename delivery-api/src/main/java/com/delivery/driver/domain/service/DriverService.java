package com.delivery.driver.domain.service;

import com.delivery.driver.domain.entity.Driver;
import com.delivery.driver.domain.entity.ProductionSite;
import com.delivery.driver.domain.repository.DriverRepository;
import com.delivery.driver.domain.repository.ProductionSiteRepository;
import com.delivery.shared.exception.DuplicateResourceException;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final ProductionSiteRepository productionSiteRepository;

    @Transactional
    public Driver createDriver(String name, String phone, String licenseNumber, UUID userId, UUID productionSiteId) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (driverRepository.existsByTenantIdAndLicenseNumber(tenantId, licenseNumber)) {
            throw new DuplicateResourceException("Driver", "licenseNumber", licenseNumber);
        }

        if (productionSiteId != null) {
            validateProductionSite(productionSiteId, tenantId);
        }

        Driver driver = Driver.builder()
                .name(name)
                .phone(phone)
                .licenseNumber(licenseNumber)
                .userId(userId)
                .productionSiteId(productionSiteId)
                .active(true)
                .build();

        return driverRepository.save(driver);
    }

    @Transactional
    public Driver updateDriver(UUID id, String name, String phone, String licenseNumber, UUID userId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Driver driver = getById(id);

        if (licenseNumber != null && !licenseNumber.equals(driver.getLicenseNumber())) {
            if (driverRepository.existsByTenantIdAndLicenseNumberAndIdNot(tenantId, licenseNumber, id)) {
                throw new DuplicateResourceException("Driver", "licenseNumber", licenseNumber);
            }
            driver.setLicenseNumber(licenseNumber);
        }

        if (name != null) {
            driver.setName(name);
        }

        if (phone != null) {
            driver.setPhone(phone);
        }

        if (userId != null) {
            driver.setUserId(userId);
        }

        return driverRepository.save(driver);
    }

    public Driver getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return driverRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));
    }

    public Page<Driver> listByTenant(Boolean active, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (active != null) {
            return driverRepository.findByTenantIdAndActive(tenantId, active, pageable);
        }

        return driverRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Driver> listByProductionSite(UUID productionSiteId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        validateProductionSite(productionSiteId, tenantId);
        return driverRepository.findByTenantIdAndProductionSiteId(tenantId, productionSiteId, pageable);
    }

    @Transactional
    public Driver activateDriver(UUID id) {
        Driver driver = getById(id);
        driver.setActive(true);
        return driverRepository.save(driver);
    }

    @Transactional
    public Driver deactivateDriver(UUID id) {
        Driver driver = getById(id);
        driver.setActive(false);
        return driverRepository.save(driver);
    }

    @Transactional
    public Driver assignToProductionSite(UUID driverId, UUID productionSiteId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Driver driver = getById(driverId);

        if (productionSiteId != null) {
            validateProductionSite(productionSiteId, tenantId);
        }

        driver.setProductionSiteId(productionSiteId);
        return driverRepository.save(driver);
    }

    private void validateProductionSite(UUID productionSiteId, UUID tenantId) {
        productionSiteRepository.findByIdAndTenantId(productionSiteId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductionSite", "id", productionSiteId));
    }
}
