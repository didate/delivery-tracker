package com.delivery.repository;

import com.delivery.domain.TenantSettings;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TenantSettings entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TenantSettingsRepository extends JpaRepository<TenantSettings, Long>, JpaSpecificationExecutor<TenantSettings> {}
