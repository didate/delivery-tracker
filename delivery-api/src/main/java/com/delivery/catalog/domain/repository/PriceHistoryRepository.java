package com.delivery.catalog.domain.repository;

import com.delivery.catalog.domain.entity.PriceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, UUID> {

    List<PriceHistory> findByProductIdAndTenantIdOrderByStartDateDesc(UUID productId, UUID tenantId);

    Page<PriceHistory> findByProductIdAndTenantId(UUID productId, UUID tenantId, Pageable pageable);

    Optional<PriceHistory> findByProductIdAndTenantIdAndEndDateIsNull(UUID productId, UUID tenantId);

    @Modifying
    @Query("UPDATE PriceHistory ph SET ph.endDate = :endDate WHERE ph.productId = :productId AND ph.tenantId = :tenantId AND ph.endDate IS NULL")
    void closeCurrentPrice(@Param("productId") UUID productId, @Param("tenantId") UUID tenantId, @Param("endDate") LocalDateTime endDate);
}
