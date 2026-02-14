package com.delivery.service;

import com.delivery.domain.RoundCustomer;
import com.delivery.repository.RoundCustomerRepository;
import com.delivery.service.dto.RoundCustomerDTO;
import com.delivery.service.mapper.RoundCustomerMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.RoundCustomer}.
 */
@Service
@Transactional
public class RoundCustomerService {

    private static final Logger LOG = LoggerFactory.getLogger(RoundCustomerService.class);

    private final RoundCustomerRepository roundCustomerRepository;

    private final RoundCustomerMapper roundCustomerMapper;

    public RoundCustomerService(RoundCustomerRepository roundCustomerRepository, RoundCustomerMapper roundCustomerMapper) {
        this.roundCustomerRepository = roundCustomerRepository;
        this.roundCustomerMapper = roundCustomerMapper;
    }

    /**
     * Save a roundCustomer.
     *
     * @param roundCustomerDTO the entity to save.
     * @return the persisted entity.
     */
    public RoundCustomerDTO save(RoundCustomerDTO roundCustomerDTO) {
        LOG.debug("Request to save RoundCustomer : {}", roundCustomerDTO);
        RoundCustomer roundCustomer = roundCustomerMapper.toEntity(roundCustomerDTO);
        roundCustomer = roundCustomerRepository.save(roundCustomer);
        return roundCustomerMapper.toDto(roundCustomer);
    }

    /**
     * Update a roundCustomer.
     *
     * @param roundCustomerDTO the entity to save.
     * @return the persisted entity.
     */
    public RoundCustomerDTO update(RoundCustomerDTO roundCustomerDTO) {
        LOG.debug("Request to update RoundCustomer : {}", roundCustomerDTO);
        RoundCustomer roundCustomer = roundCustomerMapper.toEntity(roundCustomerDTO);
        roundCustomer = roundCustomerRepository.save(roundCustomer);
        return roundCustomerMapper.toDto(roundCustomer);
    }

    /**
     * Partially update a roundCustomer.
     *
     * @param roundCustomerDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<RoundCustomerDTO> partialUpdate(RoundCustomerDTO roundCustomerDTO) {
        LOG.debug("Request to partially update RoundCustomer : {}", roundCustomerDTO);

        return roundCustomerRepository
            .findById(roundCustomerDTO.getId())
            .map(existingRoundCustomer -> {
                roundCustomerMapper.partialUpdate(existingRoundCustomer, roundCustomerDTO);

                return existingRoundCustomer;
            })
            .map(roundCustomerRepository::save)
            .map(roundCustomerMapper::toDto);
    }

    /**
     * Get one roundCustomer by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<RoundCustomerDTO> findOne(Long id) {
        LOG.debug("Request to get RoundCustomer : {}", id);
        return roundCustomerRepository.findById(id).map(roundCustomerMapper::toDto);
    }

    /**
     * Delete the roundCustomer by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete RoundCustomer : {}", id);
        roundCustomerRepository.deleteById(id);
    }
}
