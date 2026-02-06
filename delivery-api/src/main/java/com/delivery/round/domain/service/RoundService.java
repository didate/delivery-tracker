package com.delivery.round.domain.service;

import com.delivery.customer.domain.entity.Customer;
import com.delivery.customer.domain.repository.CustomerRepository;
import com.delivery.driver.domain.repository.DriverRepository;
import com.delivery.round.domain.entity.Round;
import com.delivery.round.domain.entity.RoundCustomer;
import com.delivery.round.domain.entity.RoundStatus;
import com.delivery.round.domain.repository.RoundCustomerRepository;
import com.delivery.round.domain.repository.RoundRepository;
import com.delivery.shared.exception.BusinessException;
import com.delivery.shared.exception.DuplicateResourceException;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoundService {

    private final RoundRepository roundRepository;
    private final RoundCustomerRepository roundCustomerRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public Round createRound(String name, UUID driverId, LocalDate roundDate, List<UUID> customerIds, String notes) {
        UUID tenantId = TenantContext.getCurrentTenant();

        // Validate driver exists
        driverRepository.findByIdAndTenantId(driverId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));

        // Validate all customers exist
        if (customerIds != null && !customerIds.isEmpty()) {
            for (UUID customerId : customerIds) {
                customerRepository.findByIdAndTenantId(customerId, tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
            }
        }

        Round round = Round.builder()
                .name(name)
                .driverId(driverId)
                .roundDate(roundDate)
                .status(RoundStatus.PLANNED)
                .notes(notes)
                .build();

        round = roundRepository.save(round);

        // Add customers to round in order
        if (customerIds != null && !customerIds.isEmpty()) {
            int sequence = 1;
            for (UUID customerId : customerIds) {
                RoundCustomer roundCustomer = RoundCustomer.builder()
                        .roundId(round.getId())
                        .customerId(customerId)
                        .sequenceOrder(sequence++)
                        .visited(false)
                        .build();
                roundCustomerRepository.save(roundCustomer);
            }
        }

        return round;
    }

    @Transactional
    public Round updateRound(UUID id, String name, String notes) {
        Round round = getById(id);

        if (name != null) {
            round.setName(name);
        }

        if (notes != null) {
            round.setNotes(notes);
        }

        return roundRepository.save(round);
    }

    @Transactional
    public Round updateRoundStatus(UUID id, RoundStatus status) {
        Round round = getById(id);
        round.setStatus(status);
        return roundRepository.save(round);
    }

    @Transactional
    public Round startRound(UUID id) {
        Round round = getById(id);

        if (round.getStatus() != RoundStatus.PLANNED) {
            throw new BusinessException("Round can only be started from PLANNED status");
        }

        round.setStatus(RoundStatus.IN_PROGRESS);
        round.setStartTime(LocalTime.now());
        return roundRepository.save(round);
    }

    @Transactional
    public Round completeRound(UUID id) {
        Round round = getById(id);

        if (round.getStatus() != RoundStatus.IN_PROGRESS) {
            throw new BusinessException("Round can only be completed from IN_PROGRESS status");
        }

        round.setStatus(RoundStatus.COMPLETED);
        round.setEndTime(LocalTime.now());
        return roundRepository.save(round);
    }

    @Transactional
    public RoundCustomer addCustomerToRound(UUID roundId, UUID customerId, Integer sequenceOrder) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Round round = getById(roundId);

        // Validate customer exists
        customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        // Check if customer is already in round
        if (roundCustomerRepository.existsByRoundIdAndCustomerId(roundId, customerId)) {
            throw new DuplicateResourceException("RoundCustomer", "customerId", customerId);
        }

        // If no sequence order provided, add to end
        if (sequenceOrder == null) {
            long count = roundCustomerRepository.countByRoundId(roundId);
            sequenceOrder = (int) count + 1;
        }

        RoundCustomer roundCustomer = RoundCustomer.builder()
                .roundId(roundId)
                .customerId(customerId)
                .sequenceOrder(sequenceOrder)
                .visited(false)
                .build();

        return roundCustomerRepository.save(roundCustomer);
    }

    @Transactional
    public void removeCustomerFromRound(UUID roundId, UUID customerId) {
        getById(roundId); // Validate round exists and belongs to tenant

        RoundCustomer roundCustomer = roundCustomerRepository.findByRoundIdAndCustomerId(roundId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("RoundCustomer", "customerId", customerId));

        roundCustomerRepository.delete(roundCustomer);
    }

    @Transactional
    public void reorderCustomers(UUID roundId, List<UUID> customerIds) {
        getById(roundId); // Validate round exists and belongs to tenant

        int sequence = 1;
        for (UUID customerId : customerIds) {
            RoundCustomer roundCustomer = roundCustomerRepository.findByRoundIdAndCustomerId(roundId, customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("RoundCustomer", "customerId", customerId));
            roundCustomer.setSequenceOrder(sequence++);
            roundCustomerRepository.save(roundCustomer);
        }
    }

    @Transactional
    public RoundCustomer markCustomerVisited(UUID roundId, UUID customerId, UUID deliveryId) {
        getById(roundId); // Validate round exists and belongs to tenant

        RoundCustomer roundCustomer = roundCustomerRepository.findByRoundIdAndCustomerId(roundId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("RoundCustomer", "customerId", customerId));

        roundCustomer.setVisited(true);
        roundCustomer.setVisitTime(LocalTime.now());
        roundCustomer.setDeliveryId(deliveryId);

        return roundCustomerRepository.save(roundCustomer);
    }

    public Round getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return roundRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Round", "id", id));
    }

    public Page<Round> listByDriver(UUID driverId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return roundRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
    }

    public Page<Round> listByDate(LocalDate date, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return roundRepository.findByTenantIdAndRoundDate(tenantId, date, pageable);
    }

    public Page<Round> listByStatus(RoundStatus status, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return roundRepository.findByTenantIdAndStatus(tenantId, status, pageable);
    }

    public Page<Round> listRounds(UUID driverId, LocalDate date, RoundStatus status, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (driverId != null && date != null && status != null) {
            return roundRepository.findByTenantIdAndDriverIdAndRoundDateAndStatus(tenantId, driverId, date, status, pageable);
        } else if (driverId != null && date != null) {
            return roundRepository.findByTenantIdAndDriverIdAndRoundDate(tenantId, driverId, date, pageable);
        } else if (driverId != null && status != null) {
            return roundRepository.findByTenantIdAndDriverIdAndStatus(tenantId, driverId, status, pageable);
        } else if (date != null && status != null) {
            return roundRepository.findByTenantIdAndRoundDateAndStatus(tenantId, date, status, pageable);
        } else if (driverId != null) {
            return roundRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
        } else if (date != null) {
            return roundRepository.findByTenantIdAndRoundDate(tenantId, date, pageable);
        } else if (status != null) {
            return roundRepository.findByTenantIdAndStatus(tenantId, status, pageable);
        } else {
            return roundRepository.findByTenantId(tenantId, pageable);
        }
    }

    public List<RoundCustomer> getRoundCustomers(UUID roundId) {
        getById(roundId); // Validate round exists and belongs to tenant
        return roundCustomerRepository.findByRoundIdOrderBySequenceOrder(roundId);
    }

    public RoundProgress getRoundProgress(UUID roundId) {
        getById(roundId); // Validate round exists and belongs to tenant

        long total = roundCustomerRepository.countByRoundId(roundId);
        long visited = roundCustomerRepository.countByRoundIdAndVisited(roundId, true);

        return new RoundProgress(visited, total);
    }

    public record RoundProgress(long visited, long total) {}
}
