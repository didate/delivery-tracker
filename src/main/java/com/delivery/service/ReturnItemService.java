package com.delivery.service;

import com.delivery.domain.ReturnItem;
import com.delivery.repository.ReturnItemRepository;
import com.delivery.service.dto.ReturnItemDTO;
import com.delivery.service.mapper.ReturnItemMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.delivery.domain.ReturnItem}.
 */
@Service
@Transactional
public class ReturnItemService {

    private static final Logger LOG = LoggerFactory.getLogger(ReturnItemService.class);

    private final ReturnItemRepository returnItemRepository;

    private final ReturnItemMapper returnItemMapper;

    public ReturnItemService(ReturnItemRepository returnItemRepository, ReturnItemMapper returnItemMapper) {
        this.returnItemRepository = returnItemRepository;
        this.returnItemMapper = returnItemMapper;
    }

    /**
     * Save a returnItem.
     *
     * @param returnItemDTO the entity to save.
     * @return the persisted entity.
     */
    public ReturnItemDTO save(ReturnItemDTO returnItemDTO) {
        LOG.debug("Request to save ReturnItem : {}", returnItemDTO);
        ReturnItem returnItem = returnItemMapper.toEntity(returnItemDTO);
        returnItem = returnItemRepository.save(returnItem);
        return returnItemMapper.toDto(returnItem);
    }

    /**
     * Update a returnItem.
     *
     * @param returnItemDTO the entity to save.
     * @return the persisted entity.
     */
    public ReturnItemDTO update(ReturnItemDTO returnItemDTO) {
        LOG.debug("Request to update ReturnItem : {}", returnItemDTO);
        ReturnItem returnItem = returnItemMapper.toEntity(returnItemDTO);
        returnItem = returnItemRepository.save(returnItem);
        return returnItemMapper.toDto(returnItem);
    }

    /**
     * Partially update a returnItem.
     *
     * @param returnItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ReturnItemDTO> partialUpdate(ReturnItemDTO returnItemDTO) {
        LOG.debug("Request to partially update ReturnItem : {}", returnItemDTO);

        return returnItemRepository
            .findById(returnItemDTO.getId())
            .map(existingReturnItem -> {
                returnItemMapper.partialUpdate(existingReturnItem, returnItemDTO);

                return existingReturnItem;
            })
            .map(returnItemRepository::save)
            .map(returnItemMapper::toDto);
    }

    /**
     * Get one returnItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ReturnItemDTO> findOne(Long id) {
        LOG.debug("Request to get ReturnItem : {}", id);
        return returnItemRepository.findById(id).map(returnItemMapper::toDto);
    }

    /**
     * Delete the returnItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ReturnItem : {}", id);
        returnItemRepository.deleteById(id);
    }
}
