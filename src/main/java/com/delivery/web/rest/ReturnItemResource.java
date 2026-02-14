package com.delivery.web.rest;

import com.delivery.repository.ReturnItemRepository;
import com.delivery.service.ReturnItemQueryService;
import com.delivery.service.ReturnItemService;
import com.delivery.service.criteria.ReturnItemCriteria;
import com.delivery.service.dto.ReturnItemDTO;
import com.delivery.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.delivery.domain.ReturnItem}.
 */
@RestController
@RequestMapping("/api/return-items")
public class ReturnItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReturnItemResource.class);

    private static final String ENTITY_NAME = "returnItem";

    @Value("${jhipster.clientApp.name:delivery}")
    private String applicationName;

    private final ReturnItemService returnItemService;

    private final ReturnItemRepository returnItemRepository;

    private final ReturnItemQueryService returnItemQueryService;

    public ReturnItemResource(
        ReturnItemService returnItemService,
        ReturnItemRepository returnItemRepository,
        ReturnItemQueryService returnItemQueryService
    ) {
        this.returnItemService = returnItemService;
        this.returnItemRepository = returnItemRepository;
        this.returnItemQueryService = returnItemQueryService;
    }

    /**
     * {@code POST  /return-items} : Create a new returnItem.
     *
     * @param returnItemDTO the returnItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new returnItemDTO, or with status {@code 400 (Bad Request)} if the returnItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ReturnItemDTO> createReturnItem(@Valid @RequestBody ReturnItemDTO returnItemDTO) throws URISyntaxException {
        LOG.debug("REST request to save ReturnItem : {}", returnItemDTO);
        if (returnItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new returnItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        returnItemDTO = returnItemService.save(returnItemDTO);
        return ResponseEntity.created(new URI("/api/return-items/" + returnItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, returnItemDTO.getId().toString()))
            .body(returnItemDTO);
    }

    /**
     * {@code PUT  /return-items/:id} : Updates an existing returnItem.
     *
     * @param id the id of the returnItemDTO to save.
     * @param returnItemDTO the returnItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated returnItemDTO,
     * or with status {@code 400 (Bad Request)} if the returnItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the returnItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReturnItemDTO> updateReturnItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ReturnItemDTO returnItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ReturnItem : {}, {}", id, returnItemDTO);
        if (returnItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, returnItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!returnItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        returnItemDTO = returnItemService.update(returnItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, returnItemDTO.getId().toString()))
            .body(returnItemDTO);
    }

    /**
     * {@code PATCH  /return-items/:id} : Partial updates given fields of an existing returnItem, field will ignore if it is null
     *
     * @param id the id of the returnItemDTO to save.
     * @param returnItemDTO the returnItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated returnItemDTO,
     * or with status {@code 400 (Bad Request)} if the returnItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the returnItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the returnItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ReturnItemDTO> partialUpdateReturnItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ReturnItemDTO returnItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ReturnItem partially : {}, {}", id, returnItemDTO);
        if (returnItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, returnItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!returnItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ReturnItemDTO> result = returnItemService.partialUpdate(returnItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, returnItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /return-items} : get all the returnItems.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of returnItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ReturnItemDTO>> getAllReturnItems(
        ReturnItemCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get ReturnItems by criteria: {}", criteria);

        Page<ReturnItemDTO> page = returnItemQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /return-items/count} : count all the returnItems.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countReturnItems(ReturnItemCriteria criteria) {
        LOG.debug("REST request to count ReturnItems by criteria: {}", criteria);
        return ResponseEntity.ok().body(returnItemQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /return-items/:id} : get the "id" returnItem.
     *
     * @param id the id of the returnItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the returnItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReturnItemDTO> getReturnItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ReturnItem : {}", id);
        Optional<ReturnItemDTO> returnItemDTO = returnItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(returnItemDTO);
    }

    /**
     * {@code DELETE  /return-items/:id} : delete the "id" returnItem.
     *
     * @param id the id of the returnItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReturnItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ReturnItem : {}", id);
        returnItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
