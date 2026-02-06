package com.delivery.tenant.domain.repository;

import com.delivery.tenant.domain.entity.TenantSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantSettingsRepository extends JpaRepository<TenantSettings, UUID> {

    List<TenantSettings> findByTenantId(UUID tenantId);

    Optional<TenantSettings> findByTenantIdAndKey(UUID tenantId, String key);

    void deleteByTenantIdAndKey(UUID tenantId, String key);
}
