package com.delivery.customer.domain.service;

import com.delivery.customer.domain.entity.Customer;
import com.delivery.customer.domain.repository.CustomerRepository;
import com.delivery.driver.domain.entity.Driver;
import com.delivery.driver.domain.repository.DriverRepository;
import com.delivery.shared.exception.DuplicateResourceException;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;

    @Transactional
    public Customer createCustomer(String code, String name, String phone, String email,
                                   String address, BigDecimal latitude, BigDecimal longitude, String notes) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (customerRepository.existsByTenantIdAndCode(tenantId, code)) {
            throw new DuplicateResourceException("Customer", "code", code);
        }

        Customer customer = Customer.builder()
                .code(code)
                .name(name)
                .phone(phone)
                .email(email)
                .address(address)
                .latitude(latitude)
                .longitude(longitude)
                .notes(notes)
                .active(true)
                .build();

        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(UUID id, String code, String name, String phone, String email,
                                   String address, BigDecimal latitude, BigDecimal longitude, String notes) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Customer customer = getById(id);

        if (code != null && !code.equals(customer.getCode())) {
            if (customerRepository.existsByTenantIdAndCodeAndIdNot(tenantId, code, id)) {
                throw new DuplicateResourceException("Customer", "code", code);
            }
            customer.setCode(code);
        }

        if (name != null) {
            customer.setName(name);
        }

        if (phone != null) {
            customer.setPhone(phone);
        }

        if (email != null) {
            customer.setEmail(email);
        }

        if (address != null) {
            customer.setAddress(address);
        }

        if (latitude != null) {
            customer.setLatitude(latitude);
        }

        if (longitude != null) {
            customer.setLongitude(longitude);
        }

        if (notes != null) {
            customer.setNotes(notes);
        }

        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        Customer customer = getById(id);
        customerRepository.delete(customer);
    }

    public Customer getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }

    public Customer getByCode(String code) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantIdAndCode(tenantId, code)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "code", code));
    }

    public Page<Customer> listByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Customer> listActiveByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantIdAndActive(tenantId, true, pageable);
    }

    public Page<Customer> searchByName(String name, Boolean active, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (active != null) {
            return customerRepository.findByTenantIdAndActiveAndNameContainingIgnoreCase(tenantId, active, name, pageable);
        }

        return customerRepository.findByTenantIdAndNameContainingIgnoreCase(tenantId, name, pageable);
    }

    @Transactional
    public Customer activateCustomer(UUID id) {
        Customer customer = getById(id);
        customer.setActive(true);
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer deactivateCustomer(UUID id) {
        Customer customer = getById(id);
        customer.setActive(false);
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer assignDriver(UUID customerId, UUID driverId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Customer customer = getById(customerId);

        Driver driver = driverRepository.findByIdAndTenantId(driverId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));

        customer.setDriverId(driver.getId());
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer unassignDriver(UUID customerId) {
        Customer customer = getById(customerId);
        customer.setDriverId(null);
        return customerRepository.save(customer);
    }

    @Transactional
    public List<Customer> assignDriverToMultipleCustomers(UUID driverId, List<UUID> customerIds) {
        UUID tenantId = TenantContext.getCurrentTenant();

        Driver driver = driverRepository.findByIdAndTenantId(driverId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));

        return customerIds.stream()
                .map(this::getById)
                .peek(customer -> customer.setDriverId(driver.getId()))
                .map(customerRepository::save)
                .toList();
    }

    @Transactional
    public List<Customer> unassignDriverFromAllCustomers(UUID driverId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Customer> customers = customerRepository.findByTenantIdAndDriverId(tenantId, driverId);

        customers.forEach(customer -> customer.setDriverId(null));
        return customerRepository.saveAll(customers);
    }

    public Page<Customer> listByDriver(UUID driverId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
    }

    public Page<Customer> listByDriverAndActive(UUID driverId, boolean active, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantIdAndDriverIdAndActive(tenantId, driverId, active, pageable);
    }

    public Page<Customer> listUnassigned(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantIdAndDriverIdIsNull(tenantId, pageable);
    }

    public Page<Customer> listUnassignedAndActive(boolean active, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.findByTenantIdAndDriverIdIsNullAndActive(tenantId, active, pageable);
    }

    public long countByDriver(UUID driverId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return customerRepository.countByTenantIdAndDriverId(tenantId, driverId);
    }
}
