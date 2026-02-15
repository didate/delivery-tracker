package com.delivery.repository;

import com.delivery.domain.Product;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Product entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByCode(String code);
    Optional<Product> findByIdAndTenant_Id(Long id, Long tenantId);
    boolean existsByIdAndTenant_Id(Long id, Long tenantId);
    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
