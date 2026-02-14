package com.delivery.service;

import com.delivery.domain.Round;
import com.delivery.repository.RoundRepository;
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

    public RoundService(RoundRepository roundRepository, RoundMapper roundMapper) {
        this.roundRepository = roundRepository;
        this.roundMapper = roundMapper;
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
        Round round = roundMapper.toEntity(roundDTO);
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

        return roundRepository
            .findById(roundDTO.getId())
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
        return roundRepository.findById(id).map(roundMapper::toDto);
    }

    /**
     * Delete the round by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Round : {}", id);
        roundRepository.deleteById(id);
    }
}
