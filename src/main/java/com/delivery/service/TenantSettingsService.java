package com.delivery.service;

import com.delivery.domain.Tenant;
import com.delivery.domain.TenantSettings;
import com.delivery.repository.TenantRepository;
import com.delivery.repository.TenantSettingsRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.TenantSettingsDTO;
import com.delivery.service.mapper.TenantSettingsMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.TenantSettings}.
 */
@Service
@Transactional
public class TenantSettingsService {

    private static final Logger LOG = LoggerFactory.getLogger(TenantSettingsService.class);

    private final TenantSettingsRepository tenantSettingsRepository;

    private final TenantSettingsMapper tenantSettingsMapper;

    private final TenantRepository tenantRepository;

    public TenantSettingsService(
        TenantSettingsRepository tenantSettingsRepository,
        TenantSettingsMapper tenantSettingsMapper,
        TenantRepository tenantRepository
    ) {
        this.tenantSettingsRepository = tenantSettingsRepository;
        this.tenantSettingsMapper = tenantSettingsMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a tenantSettings.
     *
     * @param tenantSettingsDTO the entity to save.
     * @return the persisted entity.
     */
    public TenantSettingsDTO save(TenantSettingsDTO tenantSettingsDTO) {
        LOG.debug("Request to save TenantSettings : {}", tenantSettingsDTO);
        TenantSettings tenantSettings = tenantSettingsMapper.toEntity(tenantSettingsDTO);
        // Auto-set tenant from context for new entities
        if (tenantSettings.getId() == null && tenantSettings.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(tenantSettings::setTenant);
        }
        tenantSettings = tenantSettingsRepository.save(tenantSettings);
        return tenantSettingsMapper.toDto(tenantSettings);
    }

    /**
     * Update a tenantSettings.
     *
     * @param tenantSettingsDTO the entity to save.
     * @return the persisted entity.
     */
    public TenantSettingsDTO update(TenantSettingsDTO tenantSettingsDTO) {
        LOG.debug("Request to update TenantSettings : {}", tenantSettingsDTO);
        TenantSettings tenantSettings = tenantSettingsMapper.toEntity(tenantSettingsDTO);
        tenantSettings = tenantSettingsRepository.save(tenantSettings);
        return tenantSettingsMapper.toDto(tenantSettings);
    }

    /**
     * Partially update a tenantSettings.
     *
     * @param tenantSettingsDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TenantSettingsDTO> partialUpdate(TenantSettingsDTO tenantSettingsDTO) {
        LOG.debug("Request to partially update TenantSettings : {}", tenantSettingsDTO);

        return tenantSettingsRepository
            .findById(tenantSettingsDTO.getId())
            .map(existingTenantSettings -> {
                tenantSettingsMapper.partialUpdate(existingTenantSettings, tenantSettingsDTO);

                return existingTenantSettings;
            })
            .map(tenantSettingsRepository::save)
            .map(tenantSettingsMapper::toDto);
    }

    /**
     * Get one tenantSettings by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TenantSettingsDTO> findOne(Long id) {
        LOG.debug("Request to get TenantSettings : {}", id);
        return tenantSettingsRepository.findById(id).map(tenantSettingsMapper::toDto);
    }

    /**
     * Delete the tenantSettings by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TenantSettings : {}", id);
        tenantSettingsRepository.deleteById(id);
    }
}
