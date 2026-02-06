package com.delivery.customer.domain.repository;

import com.delivery.customer.domain.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Page<Customer> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Customer> findByTenantIdAndActive(UUID tenantId, boolean active, Pageable pageable);

    Optional<Customer> findByTenantIdAndCode(UUID tenantId, String code);

    Optional<Customer> findByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);

    boolean existsByTenantIdAndCodeAndIdNot(UUID tenantId, String code, UUID id);

    Page<Customer> findByTenantIdAndNameContainingIgnoreCase(UUID tenantId, String name, Pageable pageable);

    Page<Customer> findByTenantIdAndActiveAndNameContainingIgnoreCase(UUID tenantId, boolean active, String name, Pageable pageable);

    // Driver assignment methods
    Page<Customer> findByTenantIdAndDriverId(UUID tenantId, UUID driverId, Pageable pageable);

    Page<Customer> findByTenantIdAndDriverIdAndActive(UUID tenantId, UUID driverId, boolean active, Pageable pageable);

    List<Customer> findByTenantIdAndDriverId(UUID tenantId, UUID driverId);

    Page<Customer> findByTenantIdAndDriverIdIsNull(UUID tenantId, Pageable pageable);

    Page<Customer> findByTenantIdAndDriverIdIsNullAndActive(UUID tenantId, boolean active, Pageable pageable);

    long countByTenantIdAndDriverId(UUID tenantId, UUID driverId);
}
