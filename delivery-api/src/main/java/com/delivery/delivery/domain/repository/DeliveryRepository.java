package com.delivery.delivery.domain.repository;

import com.delivery.delivery.domain.entity.Delivery;
import com.delivery.delivery.domain.entity.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {

    Page<Delivery> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<Delivery> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<Delivery> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId, Pageable pageable);

    Page<Delivery> findByTenantIdAndDriverId(UUID tenantId, UUID driverId, Pageable pageable);

    Page<Delivery> findByTenantIdAndDeliveryDate(UUID tenantId, LocalDate deliveryDate, Pageable pageable);

    Page<Delivery> findByTenantIdAndStatus(UUID tenantId, DeliveryStatus status, Pageable pageable);

    Page<Delivery> findByTenantIdAndDeliveryDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Delivery> findByTenantIdAndCustomerIdAndDeliveryDateBetween(UUID tenantId, UUID customerId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Delivery> findByTenantIdAndDriverIdAndDeliveryDateBetween(UUID tenantId, UUID driverId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Delivery> findByTenantIdAndDriverIdAndStatus(UUID tenantId, UUID driverId, DeliveryStatus status, Pageable pageable);

    Page<Delivery> findByTenantIdAndCustomerIdAndStatus(UUID tenantId, UUID customerId, DeliveryStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(d.totalAmount), 0) FROM Delivery d WHERE d.tenantId = :tenantId AND d.customerId = :customerId")
    BigDecimal sumTotalAmountByTenantIdAndCustomerId(@Param("tenantId") UUID tenantId, @Param("customerId") UUID customerId);
}
