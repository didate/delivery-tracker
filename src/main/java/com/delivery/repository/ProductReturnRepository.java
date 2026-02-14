package com.delivery.repository;

import com.delivery.domain.ProductReturn;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ProductReturn entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductReturnRepository extends JpaRepository<ProductReturn, Long>, JpaSpecificationExecutor<ProductReturn> {}
