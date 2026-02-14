package com.delivery.repository;

import com.delivery.domain.DeliveryItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DeliveryItem entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DeliveryItemRepository extends JpaRepository<DeliveryItem, Long>, JpaSpecificationExecutor<DeliveryItem> {}
