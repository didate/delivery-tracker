package com.delivery.service;

import com.delivery.domain.Driver;
import com.delivery.domain.Tenant;
import com.delivery.repository.DriverRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.mapper.DriverMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Driver}.
 */
@Service
@Transactional
public class DriverService {

    private static final Logger LOG = LoggerFactory.getLogger(DriverService.class);

    private final DriverRepository driverRepository;

    private final DriverMapper driverMapper;

    private final TenantRepository tenantRepository;

    public DriverService(DriverRepository driverRepository, DriverMapper driverMapper, TenantRepository tenantRepository) {
        this.driverRepository = driverRepository;
        this.driverMapper = driverMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a driver.
     *
     * @param driverDTO the entity to save.
     * @return the persisted entity.
     */
    public DriverDTO save(DriverDTO driverDTO) {
        LOG.debug("Request to save Driver : {}", driverDTO);
        Driver driver = driverMapper.toEntity(driverDTO);
        // Auto-set tenant from context for new entities
        if (driver.getId() == null && driver.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(driver::setTenant);
        }
        driver = driverRepository.save(driver);
        return driverMapper.toDto(driver);
    }

    /**
     * Update a driver.
     *
     * @param driverDTO the entity to save.
     * @return the persisted entity.
     */
    public DriverDTO update(DriverDTO driverDTO) {
        LOG.debug("Request to update Driver : {}", driverDTO);
        Driver driver = driverMapper.toEntity(driverDTO);
        driver = driverRepository.save(driver);
        return driverMapper.toDto(driver);
    }

    /**
     * Partially update a driver.
     *
     * @param driverDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DriverDTO> partialUpdate(DriverDTO driverDTO) {
        LOG.debug("Request to partially update Driver : {}", driverDTO);

        return driverRepository
            .findById(driverDTO.getId())
            .map(existingDriver -> {
                driverMapper.partialUpdate(existingDriver, driverDTO);

                return existingDriver;
            })
            .map(driverRepository::save)
            .map(driverMapper::toDto);
    }

    /**
     * Get one driver by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DriverDTO> findOne(Long id) {
        LOG.debug("Request to get Driver : {}", id);
        return driverRepository.findById(id).map(driverMapper::toDto);
    }

    /**
     * Delete the driver by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Driver : {}", id);
        driverRepository.deleteById(id);
    }
}
