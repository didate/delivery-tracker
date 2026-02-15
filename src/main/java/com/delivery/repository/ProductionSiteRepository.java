package com.delivery.repository;

import com.delivery.domain.ProductionSite;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ProductionSite entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductionSiteRepository extends JpaRepository<ProductionSite, Long>, JpaSpecificationExecutor<ProductionSite> {
    Optional<ProductionSite> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByIdAndTenant_Id(Long id, Long tenantId);

    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
