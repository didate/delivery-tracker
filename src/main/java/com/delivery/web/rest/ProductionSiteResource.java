package com.delivery.web.rest;

import com.delivery.repository.ProductionSiteRepository;
import com.delivery.service.ProductionSiteQueryService;
import com.delivery.service.ProductionSiteService;
import com.delivery.service.criteria.ProductionSiteCriteria;
import com.delivery.service.dto.ProductionSiteDTO;
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
 * REST controller for managing {@link com.delivery.domain.ProductionSite}.
 */
@RestController
@RequestMapping("/api/production-sites")
public class ProductionSiteResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProductionSiteResource.class);

    private static final String ENTITY_NAME = "productionSite";

    @Value("${jhipster.clientApp.name:delivery}")
    private String applicationName;

    private final ProductionSiteService productionSiteService;

    private final ProductionSiteRepository productionSiteRepository;

    private final ProductionSiteQueryService productionSiteQueryService;

    public ProductionSiteResource(
        ProductionSiteService productionSiteService,
        ProductionSiteRepository productionSiteRepository,
        ProductionSiteQueryService productionSiteQueryService
    ) {
        this.productionSiteService = productionSiteService;
        this.productionSiteRepository = productionSiteRepository;
        this.productionSiteQueryService = productionSiteQueryService;
    }

    /**
     * {@code POST  /production-sites} : Create a new productionSite.
     *
     * @param productionSiteDTO the productionSiteDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new productionSiteDTO, or with status {@code 400 (Bad Request)} if the productionSite has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ProductionSiteDTO> createProductionSite(@Valid @RequestBody ProductionSiteDTO productionSiteDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ProductionSite : {}", productionSiteDTO);
        if (productionSiteDTO.getId() != null) {
            throw new BadRequestAlertException("A new productionSite cannot already have an ID", ENTITY_NAME, "idexists");
        }
        productionSiteDTO = productionSiteService.save(productionSiteDTO);
        return ResponseEntity.created(new URI("/api/production-sites/" + productionSiteDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, productionSiteDTO.getId().toString()))
            .body(productionSiteDTO);
    }

    /**
     * {@code PUT  /production-sites/:id} : Updates an existing productionSite.
     *
     * @param id the id of the productionSiteDTO to save.
     * @param productionSiteDTO the productionSiteDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productionSiteDTO,
     * or with status {@code 400 (Bad Request)} if the productionSiteDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the productionSiteDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductionSiteDTO> updateProductionSite(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ProductionSiteDTO productionSiteDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ProductionSite : {}, {}", id, productionSiteDTO);
        if (productionSiteDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productionSiteDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!productionSiteRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        productionSiteDTO = productionSiteService.update(productionSiteDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productionSiteDTO.getId().toString()))
            .body(productionSiteDTO);
    }

    /**
     * {@code PATCH  /production-sites/:id} : Partial updates given fields of an existing productionSite, field will ignore if it is null
     *
     * @param id the id of the productionSiteDTO to save.
     * @param productionSiteDTO the productionSiteDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productionSiteDTO,
     * or with status {@code 400 (Bad Request)} if the productionSiteDTO is not valid,
     * or with status {@code 404 (Not Found)} if the productionSiteDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the productionSiteDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProductionSiteDTO> partialUpdateProductionSite(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ProductionSiteDTO productionSiteDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ProductionSite partially : {}, {}", id, productionSiteDTO);
        if (productionSiteDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productionSiteDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!productionSiteRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProductionSiteDTO> result = productionSiteService.partialUpdate(productionSiteDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productionSiteDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /production-sites} : get all the productionSites.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of productionSites in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ProductionSiteDTO>> getAllProductionSites(
        ProductionSiteCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get ProductionSites by criteria: {}", criteria);

        Page<ProductionSiteDTO> page = productionSiteQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /production-sites/count} : count all the productionSites.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countProductionSites(ProductionSiteCriteria criteria) {
        LOG.debug("REST request to count ProductionSites by criteria: {}", criteria);
        return ResponseEntity.ok().body(productionSiteQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /production-sites/:id} : get the "id" productionSite.
     *
     * @param id the id of the productionSiteDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the productionSiteDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductionSiteDTO> getProductionSite(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ProductionSite : {}", id);
        Optional<ProductionSiteDTO> productionSiteDTO = productionSiteService.findOne(id);
        return ResponseUtil.wrapOrNotFound(productionSiteDTO);
    }

    /**
     * {@code DELETE  /production-sites/:id} : delete the "id" productionSite.
     *
     * @param id the id of the productionSiteDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductionSite(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ProductionSite : {}", id);
        productionSiteService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
