package com.delivery.service;

import com.delivery.domain.Customer;
import com.delivery.repository.CustomerRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.mapper.CustomerMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Customer}.
 */
@Service
@Transactional
public class CustomerService {

    private static final Logger LOG = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;

    private final CustomerMapper customerMapper;

    private final TenantRepository tenantRepository;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper, TenantRepository tenantRepository) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a customer.
     *
     * @param customerDTO the entity to save.
     * @return the persisted entity.
     */
    public CustomerDTO save(CustomerDTO customerDTO) {
        LOG.debug("Request to save Customer : {}", customerDTO);
        Customer customer = customerMapper.toEntity(customerDTO);
        // Auto-set tenant from context for new entities
        if (customer.getId() == null && customer.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(customer::setTenant);
        }
        customer = customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }

    /**
     * Update a customer.
     * Users can only update customers from their current tenant.
     *
     * @param customerDTO the entity to save.
     * @return the persisted entity.
     */
    public CustomerDTO update(CustomerDTO customerDTO) {
        LOG.debug("Request to update Customer : {}", customerDTO);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || !customerRepository.existsByIdAndTenant_Id(customerDTO.getId(), tenantId)) {
            throw new IllegalArgumentException("Entity not found or access denied");
        }
        Customer customer = customerMapper.toEntity(customerDTO);
        customer = customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }

    /**
     * Check if a customer exists by id within the current tenant.
     *
     * @param id the id of the entity.
     * @return true if exists in current tenant.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return customerRepository.existsByIdAndTenant_Id(id, tenantId);
    }

    /**
     * Partially update a customer.
     * Users can only update customers from their current tenant.
     *
     * @param customerDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CustomerDTO> partialUpdate(CustomerDTO customerDTO) {
        LOG.debug("Request to partially update Customer : {}", customerDTO);

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return customerRepository
            .findByIdAndTenant_Id(customerDTO.getId(), tenantId)
            .map(existingCustomer -> {
                customerMapper.partialUpdate(existingCustomer, customerDTO);
                return existingCustomer;
            })
            .map(customerRepository::save)
            .map(customerMapper::toDto);
    }

    /**
     * Get one customer by id within the current tenant.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CustomerDTO> findOne(Long id) {
        LOG.debug("Request to get Customer : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return customerRepository.findByIdAndTenant_Id(id, tenantId).map(customerMapper::toDto);
    }

    /**
     * Delete the customer by id within the current tenant.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Customer : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            customerRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }
}
