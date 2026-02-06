package com.delivery.production.domain.repository;

import com.delivery.production.domain.entity.Production;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductionRepository extends JpaRepository<Production, UUID> {

    Optional<Production> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<Production> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Production> findByTenantIdAndProductionSiteId(UUID tenantId, UUID productionSiteId, Pageable pageable);

    Page<Production> findByTenantIdAndProductId(UUID tenantId, UUID productId, Pageable pageable);

    Page<Production> findByTenantIdAndProductionDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Production> findByTenantIdAndProductionSiteIdAndProductionDate(UUID tenantId, UUID productionSiteId, LocalDate productionDate, Pageable pageable);

    @Query("SELECT p FROM Production p WHERE p.tenantId = :tenantId " +
            "AND (:productionSiteId IS NULL OR p.productionSiteId = :productionSiteId) " +
            "AND (:productId IS NULL OR p.productId = :productId) " +
            "AND (:startDate IS NULL OR p.productionDate >= :startDate) " +
            "AND (:endDate IS NULL OR p.productionDate <= :endDate)")
    Page<Production> findByFilters(
            @Param("tenantId") UUID tenantId,
            @Param("productionSiteId") UUID productionSiteId,
            @Param("productId") UUID productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT p.productId, SUM(p.quantity) FROM Production p " +
            "WHERE p.tenantId = :tenantId " +
            "AND (:productionSiteId IS NULL OR p.productionSiteId = :productionSiteId) " +
            "AND (:startDate IS NULL OR p.productionDate >= :startDate) " +
            "AND (:endDate IS NULL OR p.productionDate <= :endDate) " +
            "GROUP BY p.productId")
    List<Object[]> getProductionSummaryByProduct(
            @Param("tenantId") UUID tenantId,
            @Param("productionSiteId") UUID productionSiteId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
