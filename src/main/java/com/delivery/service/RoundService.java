package com.delivery.service;

import com.delivery.domain.Round;
import com.delivery.domain.Tenant;
import com.delivery.repository.RoundRepository;
import com.delivery.repository.TenantRepository;
import com.delivery.security.TenantContext;
import com.delivery.service.dto.RoundDTO;
import com.delivery.service.mapper.RoundMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.Round}.
 */
@Service
@Transactional
public class RoundService {

    private static final Logger LOG = LoggerFactory.getLogger(RoundService.class);

    private final RoundRepository roundRepository;

    private final RoundMapper roundMapper;

    private final TenantRepository tenantRepository;

    public RoundService(RoundRepository roundRepository, RoundMapper roundMapper, TenantRepository tenantRepository) {
        this.roundRepository = roundRepository;
        this.roundMapper = roundMapper;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Save a round.
     *
     * @param roundDTO the entity to save.
     * @return the persisted entity.
     */
    public RoundDTO save(RoundDTO roundDTO) {
        LOG.debug("Request to save Round : {}", roundDTO);
        Round round = roundMapper.toEntity(roundDTO);
        // Auto-set tenant from context for new entities
        if (round.getId() == null && round.getTenant() == null && TenantContext.hasTenant()) {
            tenantRepository.findById(TenantContext.getCurrentTenant()).ifPresent(round::setTenant);
        }
        round = roundRepository.save(round);
        return roundMapper.toDto(round);
    }

    /**
     * Update a round.
     *
     * @param roundDTO the entity to save.
     * @return the persisted entity.
     */
    public RoundDTO update(RoundDTO roundDTO) {
        LOG.debug("Request to update Round : {}", roundDTO);
        Long tenantId = TenantContext.getCurrentTenant();
        Round round = roundMapper.toEntity(roundDTO);
        // Preserve tenant from context
        tenantRepository.findById(tenantId).ifPresent(round::setTenant);
        round = roundRepository.save(round);
        return roundMapper.toDto(round);
    }

    /**
     * Partially update a round.
     *
     * @param roundDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<RoundDTO> partialUpdate(RoundDTO roundDTO) {
        LOG.debug("Request to partially update Round : {}", roundDTO);

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }

        return roundRepository
            .findByIdAndTenant_Id(roundDTO.getId(), tenantId)
            .map(existingRound -> {
                roundMapper.partialUpdate(existingRound, roundDTO);

                return existingRound;
            })
            .map(roundRepository::save)
            .map(roundMapper::toDto);
    }

    /**
     * Get one round by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<RoundDTO> findOne(Long id) {
        LOG.debug("Request to get Round : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return Optional.empty();
        }
        return roundRepository.findByIdAndTenant_Id(id, tenantId).map(roundMapper::toDto);
    }

    /**
     * Delete the round by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Round : {}", id);
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            roundRepository.deleteByIdAndTenant_Id(id, tenantId);
        }
    }

    /**
     * Check if a round exists by id within the current tenant.
     *
     * @param id the id of the entity.
     * @return true if the entity exists in the current tenant, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return roundRepository.existsByIdAndTenant_Id(id, tenantId);
    }
}
