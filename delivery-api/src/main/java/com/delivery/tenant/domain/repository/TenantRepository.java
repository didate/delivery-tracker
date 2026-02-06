package com.delivery.tenant.domain.repository;

import com.delivery.tenant.domain.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findByCode(String code);

    Optional<Tenant> findByEmail(String email);

    boolean existsByCode(String code);

    boolean existsByEmail(String email);

    Optional<Tenant> findByIdAndActiveTrue(UUID id);
}
