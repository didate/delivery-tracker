package com.delivery.repository;

import com.delivery.domain.Delivery;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Delivery entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long>, JpaSpecificationExecutor<Delivery> {
    Optional<Delivery> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByIdAndTenant_Id(Long id, Long tenantId);

    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
