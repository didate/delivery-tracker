package com.delivery.repository;

import com.delivery.domain.TenantSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TenantSettings entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TenantSettingsRepository extends JpaRepository<TenantSettings, Long>, JpaSpecificationExecutor<TenantSettings> {
    Optional<TenantSettings> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByIdAndTenant_Id(Long id, Long tenantId);

    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
