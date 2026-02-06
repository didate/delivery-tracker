package com.delivery.round.domain.repository;

import com.delivery.round.domain.entity.Round;
import com.delivery.round.domain.entity.RoundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoundRepository extends JpaRepository<Round, UUID> {

    Optional<Round> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<Round> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Round> findByTenantIdAndDriverId(UUID tenantId, UUID driverId, Pageable pageable);

    Page<Round> findByTenantIdAndRoundDate(UUID tenantId, LocalDate roundDate, Pageable pageable);

    Page<Round> findByTenantIdAndStatus(UUID tenantId, RoundStatus status, Pageable pageable);

    Page<Round> findByTenantIdAndDriverIdAndRoundDate(UUID tenantId, UUID driverId, LocalDate roundDate, Pageable pageable);

    Page<Round> findByTenantIdAndDriverIdAndStatus(UUID tenantId, UUID driverId, RoundStatus status, Pageable pageable);

    Page<Round> findByTenantIdAndRoundDateAndStatus(UUID tenantId, LocalDate roundDate, RoundStatus status, Pageable pageable);

    Page<Round> findByTenantIdAndDriverIdAndRoundDateAndStatus(UUID tenantId, UUID driverId, LocalDate roundDate, RoundStatus status, Pageable pageable);
}
