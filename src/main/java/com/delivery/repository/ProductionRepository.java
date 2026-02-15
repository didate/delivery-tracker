package com.delivery.repository;

import com.delivery.domain.Production;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Production entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductionRepository extends JpaRepository<Production, Long>, JpaSpecificationExecutor<Production> {
    Optional<Production> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByIdAndTenant_Id(Long id, Long tenantId);

    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
