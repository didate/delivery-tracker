package com.delivery.returns.domain.repository;

import com.delivery.returns.domain.entity.ProductReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductReturnRepository extends JpaRepository<ProductReturn, UUID> {

    Optional<ProductReturn> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<ProductReturn> findByTenantId(UUID tenantId, Pageable pageable);

    List<ProductReturn> findByTenantId(UUID tenantId);

    Page<ProductReturn> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId, Pageable pageable);

    List<ProductReturn> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

    Page<ProductReturn> findByTenantIdAndDriverId(UUID tenantId, UUID driverId, Pageable pageable);

    List<ProductReturn> findByTenantIdAndDriverId(UUID tenantId, UUID driverId);

    Page<ProductReturn> findByTenantIdAndReturnDate(UUID tenantId, LocalDate returnDate, Pageable pageable);

    List<ProductReturn> findByTenantIdAndReturnDate(UUID tenantId, LocalDate returnDate);

    Page<ProductReturn> findByTenantIdAndReturnDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<ProductReturn> findByTenantIdAndReturnDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate);

    Page<ProductReturn> findByTenantIdAndCustomerIdAndReturnDateBetween(
            UUID tenantId, UUID customerId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<ProductReturn> findByTenantIdAndDriverIdAndReturnDateBetween(
            UUID tenantId, UUID driverId, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
