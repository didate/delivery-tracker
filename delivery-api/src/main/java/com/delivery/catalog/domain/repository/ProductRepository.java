package com.delivery.catalog.domain.repository;

import com.delivery.catalog.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<Product> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Product> findByTenantIdAndActive(UUID tenantId, boolean active, Pageable pageable);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.code FROM Product p WHERE p.tenantId = :tenantId ORDER BY p.createdDate DESC LIMIT 1")
    Optional<String> findLastCodeByTenantId(@Param("tenantId") UUID tenantId);
}
