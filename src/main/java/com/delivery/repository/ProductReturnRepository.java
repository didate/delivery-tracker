package com.delivery.repository;

import com.delivery.domain.ProductReturn;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ProductReturn entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductReturnRepository extends JpaRepository<ProductReturn, Long>, JpaSpecificationExecutor<ProductReturn> {
    Optional<ProductReturn> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByIdAndTenant_Id(Long id, Long tenantId);

    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
