package com.delivery.driver.domain.repository;

import com.delivery.driver.domain.entity.ProductionSite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductionSiteRepository extends JpaRepository<ProductionSite, UUID> {

    Optional<ProductionSite> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<ProductionSite> findByTenantId(UUID tenantId, Pageable pageable);

    Page<ProductionSite> findByTenantIdAndActive(UUID tenantId, boolean active, Pageable pageable);

    boolean existsByTenantIdAndName(UUID tenantId, String name);

    boolean existsByTenantIdAndNameAndIdNot(UUID tenantId, String name, UUID id);
}
