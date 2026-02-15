package com.delivery.web.rest;

import com.delivery.service.ProductReturnQueryService;
import com.delivery.service.ProductReturnService;
import com.delivery.service.criteria.ProductReturnCriteria;
import com.delivery.service.dto.ProductReturnDTO;
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
 * REST controller for managing {@link com.delivery.domain.ProductReturn}.
 */
@RestController
@RequestMapping("/api/product-returns")
public class ProductReturnResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProductReturnResource.class);

    private static final String ENTITY_NAME = "productReturn";

    @Value("${jhipster.clientApp.name:delivery}")
    private String applicationName;

    private final ProductReturnService productReturnService;

    private final ProductReturnQueryService productReturnQueryService;

    public ProductReturnResource(ProductReturnService productReturnService, ProductReturnQueryService productReturnQueryService) {
        this.productReturnService = productReturnService;
        this.productReturnQueryService = productReturnQueryService;
    }

    /**
     * {@code POST  /product-returns} : Create a new productReturn.
     *
     * @param productReturnDTO the productReturnDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new productReturnDTO, or with status {@code 400 (Bad Request)} if the productReturn has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ProductReturnDTO> createProductReturn(@Valid @RequestBody ProductReturnDTO productReturnDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ProductReturn : {}", productReturnDTO);
        if (productReturnDTO.getId() != null) {
            throw new BadRequestAlertException("A new productReturn cannot already have an ID", ENTITY_NAME, "idexists");
        }
        productReturnDTO = productReturnService.save(productReturnDTO);
        return ResponseEntity.created(new URI("/api/product-returns/" + productReturnDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, productReturnDTO.getId().toString()))
            .body(productReturnDTO);
    }

    /**
     * {@code PUT  /product-returns/:id} : Updates an existing productReturn.
     *
     * @param id the id of the productReturnDTO to save.
     * @param productReturnDTO the productReturnDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productReturnDTO,
     * or with status {@code 400 (Bad Request)} if the productReturnDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the productReturnDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductReturnDTO> updateProductReturn(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ProductReturnDTO productReturnDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ProductReturn : {}, {}", id, productReturnDTO);
        if (productReturnDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productReturnDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!productReturnService.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        productReturnDTO = productReturnService.update(productReturnDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productReturnDTO.getId().toString()))
            .body(productReturnDTO);
    }

    /**
     * {@code PATCH  /product-returns/:id} : Partial updates given fields of an existing productReturn, field will ignore if it is null
     *
     * @param id the id of the productReturnDTO to save.
     * @param productReturnDTO the productReturnDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productReturnDTO,
     * or with status {@code 400 (Bad Request)} if the productReturnDTO is not valid,
     * or with status {@code 404 (Not Found)} if the productReturnDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the productReturnDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProductReturnDTO> partialUpdateProductReturn(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ProductReturnDTO productReturnDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ProductReturn partially : {}, {}", id, productReturnDTO);
        if (productReturnDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productReturnDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!productReturnService.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProductReturnDTO> result = productReturnService.partialUpdate(productReturnDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productReturnDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /product-returns} : get all the productReturns.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of productReturns in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ProductReturnDTO>> getAllProductReturns(
        ProductReturnCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get ProductReturns by criteria: {}", criteria);

        Page<ProductReturnDTO> page = productReturnQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /product-returns/count} : count all the productReturns.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countProductReturns(ProductReturnCriteria criteria) {
        LOG.debug("REST request to count ProductReturns by criteria: {}", criteria);
        return ResponseEntity.ok().body(productReturnQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /product-returns/:id} : get the "id" productReturn.
     *
     * @param id the id of the productReturnDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the productReturnDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductReturnDTO> getProductReturn(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ProductReturn : {}", id);
        Optional<ProductReturnDTO> productReturnDTO = productReturnService.findOne(id);
        return ResponseUtil.wrapOrNotFound(productReturnDTO);
    }

    /**
     * {@code DELETE  /product-returns/:id} : delete the "id" productReturn.
     *
     * @param id the id of the productReturnDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductReturn(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ProductReturn : {}", id);
        productReturnService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
