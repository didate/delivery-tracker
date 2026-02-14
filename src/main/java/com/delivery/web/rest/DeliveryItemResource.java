package com.delivery.web.rest;

import com.delivery.repository.DeliveryItemRepository;
import com.delivery.service.DeliveryItemQueryService;
import com.delivery.service.DeliveryItemService;
import com.delivery.service.criteria.DeliveryItemCriteria;
import com.delivery.service.dto.DeliveryItemDTO;
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
 * REST controller for managing {@link com.delivery.domain.DeliveryItem}.
 */
@RestController
@RequestMapping("/api/delivery-items")
public class DeliveryItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(DeliveryItemResource.class);

    private static final String ENTITY_NAME = "deliveryItem";

    @Value("${jhipster.clientApp.name:delivery}")
    private String applicationName;

    private final DeliveryItemService deliveryItemService;

    private final DeliveryItemRepository deliveryItemRepository;

    private final DeliveryItemQueryService deliveryItemQueryService;

    public DeliveryItemResource(
        DeliveryItemService deliveryItemService,
        DeliveryItemRepository deliveryItemRepository,
        DeliveryItemQueryService deliveryItemQueryService
    ) {
        this.deliveryItemService = deliveryItemService;
        this.deliveryItemRepository = deliveryItemRepository;
        this.deliveryItemQueryService = deliveryItemQueryService;
    }

    /**
     * {@code POST  /delivery-items} : Create a new deliveryItem.
     *
     * @param deliveryItemDTO the deliveryItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new deliveryItemDTO, or with status {@code 400 (Bad Request)} if the deliveryItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DeliveryItemDTO> createDeliveryItem(@Valid @RequestBody DeliveryItemDTO deliveryItemDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save DeliveryItem : {}", deliveryItemDTO);
        if (deliveryItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new deliveryItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        deliveryItemDTO = deliveryItemService.save(deliveryItemDTO);
        return ResponseEntity.created(new URI("/api/delivery-items/" + deliveryItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, deliveryItemDTO.getId().toString()))
            .body(deliveryItemDTO);
    }

    /**
     * {@code PUT  /delivery-items/:id} : Updates an existing deliveryItem.
     *
     * @param id the id of the deliveryItemDTO to save.
     * @param deliveryItemDTO the deliveryItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated deliveryItemDTO,
     * or with status {@code 400 (Bad Request)} if the deliveryItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the deliveryItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DeliveryItemDTO> updateDeliveryItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DeliveryItemDTO deliveryItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DeliveryItem : {}, {}", id, deliveryItemDTO);
        if (deliveryItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, deliveryItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!deliveryItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        deliveryItemDTO = deliveryItemService.update(deliveryItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, deliveryItemDTO.getId().toString()))
            .body(deliveryItemDTO);
    }

    /**
     * {@code PATCH  /delivery-items/:id} : Partial updates given fields of an existing deliveryItem, field will ignore if it is null
     *
     * @param id the id of the deliveryItemDTO to save.
     * @param deliveryItemDTO the deliveryItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated deliveryItemDTO,
     * or with status {@code 400 (Bad Request)} if the deliveryItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the deliveryItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the deliveryItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DeliveryItemDTO> partialUpdateDeliveryItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DeliveryItemDTO deliveryItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DeliveryItem partially : {}, {}", id, deliveryItemDTO);
        if (deliveryItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, deliveryItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!deliveryItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DeliveryItemDTO> result = deliveryItemService.partialUpdate(deliveryItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, deliveryItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /delivery-items} : get all the deliveryItems.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of deliveryItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<DeliveryItemDTO>> getAllDeliveryItems(
        DeliveryItemCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get DeliveryItems by criteria: {}", criteria);

        Page<DeliveryItemDTO> page = deliveryItemQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /delivery-items/count} : count all the deliveryItems.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countDeliveryItems(DeliveryItemCriteria criteria) {
        LOG.debug("REST request to count DeliveryItems by criteria: {}", criteria);
        return ResponseEntity.ok().body(deliveryItemQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /delivery-items/:id} : get the "id" deliveryItem.
     *
     * @param id the id of the deliveryItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the deliveryItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DeliveryItemDTO> getDeliveryItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DeliveryItem : {}", id);
        Optional<DeliveryItemDTO> deliveryItemDTO = deliveryItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(deliveryItemDTO);
    }

    /**
     * {@code DELETE  /delivery-items/:id} : delete the "id" deliveryItem.
     *
     * @param id the id of the deliveryItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DeliveryItem : {}", id);
        deliveryItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
