package com.delivery.service;

import com.delivery.domain.Payment;
import com.delivery.domain.Tenant;
import com.delivery.repository.PaymentRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.PaymentDTO;
import com.delivery.service.mapper.PaymentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Payment}.
 */
@Service
@Transactional
public class PaymentService {

    private static final Logger LOG = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;

    private final PaymentMapper paymentMapper;

    private final TenantRepository tenantRepository;

    public PaymentService(PaymentRepository paymentRepository, PaymentMapper paymentMapper, TenantRepository tenantRepository) {
        this.paymentRepository = paymentRepository;
        this.paymentMapper = paymentMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a payment.
     *
     * @param paymentDTO the entity to save.
     * @return the persisted entity.
     */
    public PaymentDTO save(PaymentDTO paymentDTO) {
        LOG.debug("Request to save Payment : {}", paymentDTO);
        Payment payment = paymentMapper.toEntity(paymentDTO);
        // Auto-set tenant from context for new entities
        if (payment.getId() == null && payment.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(payment::setTenant);
        }
        payment = paymentRepository.save(payment);
        return paymentMapper.toDto(payment);
    }

    /**
     * Update a payment.
     *
     * @param paymentDTO the entity to save.
     * @return the persisted entity.
     */
    public PaymentDTO update(PaymentDTO paymentDTO) {
        LOG.debug("Request to update Payment : {}", paymentDTO);
        // Verify tenant ownership
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || !paymentRepository.existsByIdAndTenant_Id(paymentDTO.getId(), tenantId)) {
            throw new IllegalArgumentException("Entity not found or access denied");
        }
        Payment payment = paymentMapper.toEntity(paymentDTO);
        payment = paymentRepository.save(payment);
        return paymentMapper.toDto(payment);
    }

    /**
     * Partially update a payment.
     * Users can only update payments from their current tenant.
     *
     * @param paymentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PaymentDTO> partialUpdate(PaymentDTO paymentDTO) {
        LOG.debug("Request to partially update Payment : {}", paymentDTO);

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return paymentRepository
            .findByIdAndTenant_Id(paymentDTO.getId(), tenantId)
            .map(existingPayment -> {
                paymentMapper.partialUpdate(existingPayment, paymentDTO);
                return existingPayment;
            })
            .map(paymentRepository::save)
            .map(paymentMapper::toDto);
    }

    /**
     * Get one payment by id.
     * Users can only access payments from their current tenant.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PaymentDTO> findOne(Long id) {
        LOG.debug("Request to get Payment : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return paymentRepository.findByIdAndTenant_Id(id, tenantId).map(paymentMapper::toDto);
    }

    /**
     * Delete the payment by id.
     * Users can only delete payments from their current tenant.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Payment : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            paymentRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }

    /**
     * Check if a payment exists by id.
     * Users can only check payments from their current tenant.
     *
     * @param id the id of the entity.
     * @return true if the entity exists, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        LOG.debug("Request to check if Payment exists : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return paymentRepository.existsByIdAndTenant_Id(id, tenantId);
    }
}
