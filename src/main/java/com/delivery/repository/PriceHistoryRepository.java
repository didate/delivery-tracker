package com.delivery.repository;

import com.delivery.domain.PriceHistory;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PriceHistory entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long>, JpaSpecificationExecutor<PriceHistory> {}
