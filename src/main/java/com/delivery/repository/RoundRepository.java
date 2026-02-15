package com.delivery.repository;

import com.delivery.domain.Round;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Round entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RoundRepository extends JpaRepository<Round, Long>, JpaSpecificationExecutor<Round> {
    Optional<Round> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByIdAndTenant_Id(Long id, Long tenantId);

    void deleteByIdAndTenant_Id(Long id, Long tenantId);
}
