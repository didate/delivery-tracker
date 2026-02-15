package com.delivery.repository;

import com.delivery.domain.PriceHistory;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PriceHistory entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long>, JpaSpecificationExecutor<PriceHistory> {
    /**
     * Find the current active price history for a product (where endDate is null).
     *
     * @param productId the product id
     * @return the active price history if found
     */
    @Query("SELECT ph FROM PriceHistory ph WHERE ph.product.id = :productId AND ph.endDate IS NULL ORDER BY ph.effectiveDate DESC")
    Optional<PriceHistory> findCurrentActiveByProductId(@Param("productId") Long productId);
}
