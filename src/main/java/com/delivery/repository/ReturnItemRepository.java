package com.delivery.repository;

import com.delivery.domain.ReturnItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ReturnItem entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, Long>, JpaSpecificationExecutor<ReturnItem> {}
