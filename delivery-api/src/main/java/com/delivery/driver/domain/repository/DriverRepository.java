package com.delivery.driver.domain.repository;

import com.delivery.driver.domain.entity.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {

    Optional<Driver> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<Driver> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    Page<Driver> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Driver> findByTenantIdAndActive(UUID tenantId, boolean active, Pageable pageable);

    Page<Driver> findByTenantIdAndProductionSiteId(UUID tenantId, UUID productionSiteId, Pageable pageable);

    boolean existsByTenantIdAndLicenseNumber(UUID tenantId, String licenseNumber);

    boolean existsByTenantIdAndLicenseNumberAndIdNot(UUID tenantId, String licenseNumber, UUID id);
}
