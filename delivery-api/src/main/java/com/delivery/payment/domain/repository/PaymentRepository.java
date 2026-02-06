package com.delivery.payment.domain.repository;

import com.delivery.payment.domain.entity.Payment;
import com.delivery.payment.domain.entity.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<Payment> findByTenantId(UUID tenantId, Pageable pageable);

    List<Payment> findByTenantId(UUID tenantId);

    Page<Payment> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId, Pageable pageable);

    List<Payment> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

    Page<Payment> findByTenantIdAndDriverId(UUID tenantId, UUID driverId, Pageable pageable);

    List<Payment> findByTenantIdAndDriverId(UUID tenantId, UUID driverId);

    Page<Payment> findByTenantIdAndPaymentDate(UUID tenantId, LocalDate paymentDate, Pageable pageable);

    List<Payment> findByTenantIdAndPaymentDate(UUID tenantId, LocalDate paymentDate);

    Page<Payment> findByTenantIdAndPaymentDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<Payment> findByTenantIdAndPaymentDateBetween(UUID tenantId, LocalDate startDate, LocalDate endDate);

    Page<Payment> findByTenantIdAndPaymentMethod(UUID tenantId, PaymentMethod paymentMethod, Pageable pageable);

    List<Payment> findByTenantIdAndPaymentMethod(UUID tenantId, PaymentMethod paymentMethod);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.tenantId = :tenantId AND p.customerId = :customerId")
    BigDecimal sumAmountByTenantIdAndCustomerId(@Param("tenantId") UUID tenantId, @Param("customerId") UUID customerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.tenantId = :tenantId AND p.driverId = :driverId AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByTenantIdAndDriverIdAndPaymentDateBetween(
            @Param("tenantId") UUID tenantId,
            @Param("driverId") UUID driverId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    Page<Payment> findByTenantIdAndCustomerIdAndPaymentDateBetween(
            UUID tenantId, UUID customerId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Payment> findByTenantIdAndDriverIdAndPaymentDateBetween(
            UUID tenantId, UUID driverId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<Payment> findByTenantIdAndDriverIdAndPaymentDateBetween(
            UUID tenantId, UUID driverId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.tenantId = :tenantId AND p.paymentMethod = :paymentMethod")
    BigDecimal sumAmountByTenantIdAndPaymentMethod(@Param("tenantId") UUID tenantId, @Param("paymentMethod") PaymentMethod paymentMethod);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.tenantId = :tenantId")
    BigDecimal sumAmountByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.tenantId = :tenantId AND p.driverId = :driverId")
    BigDecimal sumAmountByTenantIdAndDriverId(@Param("tenantId") UUID tenantId, @Param("driverId") UUID driverId);
}
