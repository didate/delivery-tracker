package com.delivery.payment.domain.service;

import com.delivery.delivery.domain.repository.DeliveryRepository;
import com.delivery.payment.domain.entity.Payment;
import com.delivery.payment.domain.entity.PaymentMethod;
import com.delivery.payment.domain.repository.PaymentRepository;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final DeliveryRepository deliveryRepository;

    @Transactional
    public Payment createPayment(UUID customerId, UUID driverId, BigDecimal amount,
                                  PaymentMethod paymentMethod, LocalDate paymentDate,
                                  String reference, String notes) {
        Payment payment = Payment.builder()
                .customerId(customerId)
                .driverId(driverId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .paymentDate(paymentDate)
                .reference(reference)
                .notes(notes)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePayment(UUID id, BigDecimal amount, PaymentMethod paymentMethod,
                                  String reference, String notes) {
        Payment payment = getById(id);

        if (amount != null) {
            payment.setAmount(amount);
        }

        if (paymentMethod != null) {
            payment.setPaymentMethod(paymentMethod);
        }

        if (reference != null) {
            payment.setReference(reference);
        }

        if (notes != null) {
            payment.setNotes(notes);
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(UUID id) {
        Payment payment = getById(id);
        paymentRepository.delete(payment);
    }

    public Payment getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    public Page<Payment> listByCustomer(UUID customerId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantIdAndCustomerId(tenantId, customerId, pageable);
    }

    public Page<Payment> listByDriver(UUID driverId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
    }

    public Page<Payment> listByDate(LocalDate date, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantIdAndPaymentDate(tenantId, date, pageable);
    }

    public Page<Payment> listByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantIdAndPaymentDateBetween(tenantId, startDate, endDate, pageable);
    }

    public Page<Payment> listByMethod(PaymentMethod paymentMethod, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantIdAndPaymentMethod(tenantId, paymentMethod, pageable);
    }

    public Page<Payment> listByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantId(tenantId, pageable);
    }

    public BigDecimal getTotalPaymentsByCustomer(UUID customerId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.sumAmountByTenantIdAndCustomerId(tenantId, customerId);
    }

    public BigDecimal getTotalCollectionsByDriver(UUID driverId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.sumAmountByTenantIdAndDriverId(tenantId, driverId);
    }

    public BigDecimal getTotalCollectionsByDriverAndDateRange(UUID driverId, LocalDate startDate, LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.sumAmountByTenantIdAndDriverIdAndPaymentDateBetween(tenantId, driverId, startDate, endDate);
    }

    public BigDecimal getCustomerBalance(UUID customerId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        BigDecimal totalDeliveries = deliveryRepository.sumTotalAmountByTenantIdAndCustomerId(tenantId, customerId);
        BigDecimal totalPayments = paymentRepository.sumAmountByTenantIdAndCustomerId(tenantId, customerId);
        return totalDeliveries.subtract(totalPayments);
    }

    public BigDecimal getTotalByPaymentMethod(PaymentMethod paymentMethod) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.sumAmountByTenantIdAndPaymentMethod(tenantId, paymentMethod);
    }

    public BigDecimal getTotalPayments() {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.sumAmountByTenantId(tenantId);
    }

    public Page<Payment> listWithFilters(UUID customerId, UUID driverId, LocalDate date,
                                          PaymentMethod paymentMethod, LocalDate startDate,
                                          LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        // Apply filters based on what's provided
        if (customerId != null && startDate != null && endDate != null) {
            return paymentRepository.findByTenantIdAndCustomerIdAndPaymentDateBetween(
                    tenantId, customerId, startDate, endDate, pageable);
        }

        if (driverId != null && startDate != null && endDate != null) {
            return paymentRepository.findByTenantIdAndDriverIdAndPaymentDateBetween(
                    tenantId, driverId, startDate, endDate, pageable);
        }

        if (customerId != null) {
            return paymentRepository.findByTenantIdAndCustomerId(tenantId, customerId, pageable);
        }

        if (driverId != null) {
            return paymentRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
        }

        if (date != null) {
            return paymentRepository.findByTenantIdAndPaymentDate(tenantId, date, pageable);
        }

        if (paymentMethod != null) {
            return paymentRepository.findByTenantIdAndPaymentMethod(tenantId, paymentMethod, pageable);
        }

        if (startDate != null && endDate != null) {
            return paymentRepository.findByTenantIdAndPaymentDateBetween(tenantId, startDate, endDate, pageable);
        }

        return paymentRepository.findByTenantId(tenantId, pageable);
    }

    public List<Payment> listByDriverAndDateRange(UUID driverId, LocalDate startDate, LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return paymentRepository.findByTenantIdAndDriverIdAndPaymentDateBetween(tenantId, driverId, startDate, endDate);
    }
}
