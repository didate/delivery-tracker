package com.delivery.web.rest;

import static com.delivery.security.SecurityUtils.AUTHORITIES_CLAIM;
import static com.delivery.security.SecurityUtils.JWT_ALGORITHM;
import static com.delivery.security.SecurityUtils.TENANT_ID_CLAIM;
import static com.delivery.security.SecurityUtils.USER_ID_CLAIM;

import com.delivery.repository.TenantRepository;
import com.delivery.repository.UserRepository;
import com.delivery.security.AuthoritiesConstants;
import com.delivery.security.SecurityUtils;
import com.delivery.service.TenantQueryService;
import com.delivery.service.TenantService;
import com.delivery.service.criteria.TenantCriteria;
import com.delivery.service.dto.TenantDTO;
import com.delivery.web.rest.errors.BadRequestAlertException;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.delivery.domain.Tenant}.
 * Only accessible by ADMIN users.
 */
@RestController
@RequestMapping("/api/tenants")
@PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
public class TenantResource {

    private static final Logger LOG = LoggerFactory.getLogger(TenantResource.class);

    private static final String ENTITY_NAME = "tenant";

    @Value("${jhipster.clientApp.name:delivery}")
    private String applicationName;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds:0}")
    private long tokenValidityInSeconds;

    private final TenantService tenantService;

    private final TenantRepository tenantRepository;

    private final TenantQueryService tenantQueryService;

    private final JwtEncoder jwtEncoder;

    private final UserRepository userRepository;

    public TenantResource(
        TenantService tenantService,
        TenantRepository tenantRepository,
        TenantQueryService tenantQueryService,
        JwtEncoder jwtEncoder,
        UserRepository userRepository
    ) {
        this.tenantService = tenantService;
        this.tenantRepository = tenantRepository;
        this.tenantQueryService = tenantQueryService;
        this.jwtEncoder = jwtEncoder;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /tenants} : Create a new tenant.
     *
     * @param tenantDTO the tenantDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tenantDTO, or with status {@code 400 (Bad Request)} if the tenant has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TenantDTO> createTenant(@Valid @RequestBody TenantDTO tenantDTO) throws URISyntaxException {
        LOG.debug("REST request to save Tenant : {}", tenantDTO);
        if (tenantDTO.getId() != null) {
            throw new BadRequestAlertException("A new tenant cannot already have an ID", ENTITY_NAME, "idexists");
        }
        tenantDTO = tenantService.save(tenantDTO);
        return ResponseEntity.created(new URI("/api/tenants/" + tenantDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, tenantDTO.getId().toString()))
            .body(tenantDTO);
    }

    /**
     * {@code PUT  /tenants/:id} : Updates an existing tenant.
     *
     * @param id the id of the tenantDTO to save.
     * @param tenantDTO the tenantDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tenantDTO,
     * or with status {@code 400 (Bad Request)} if the tenantDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tenantDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TenantDTO> updateTenant(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TenantDTO tenantDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Tenant : {}, {}", id, tenantDTO);
        if (tenantDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tenantDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tenantRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        tenantDTO = tenantService.update(tenantDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tenantDTO.getId().toString()))
            .body(tenantDTO);
    }

    /**
     * {@code PATCH  /tenants/:id} : Partial updates given fields of an existing tenant, field will ignore if it is null
     *
     * @param id the id of the tenantDTO to save.
     * @param tenantDTO the tenantDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tenantDTO,
     * or with status {@code 400 (Bad Request)} if the tenantDTO is not valid,
     * or with status {@code 404 (Not Found)} if the tenantDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the tenantDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TenantDTO> partialUpdateTenant(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TenantDTO tenantDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Tenant partially : {}, {}", id, tenantDTO);
        if (tenantDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tenantDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tenantRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TenantDTO> result = tenantService.partialUpdate(tenantDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tenantDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /tenants} : get all the tenants.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tenants in body.
     */
    @GetMapping("")
    public ResponseEntity<List<TenantDTO>> getAllTenants(
        TenantCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Tenants by criteria: {}", criteria);

        Page<TenantDTO> page = tenantQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /tenants/count} : count all the tenants.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countTenants(TenantCriteria criteria) {
        LOG.debug("REST request to count Tenants by criteria: {}", criteria);
        return ResponseEntity.ok().body(tenantQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /tenants/:id} : get the "id" tenant.
     *
     * @param id the id of the tenantDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tenantDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TenantDTO> getTenant(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Tenant : {}", id);
        Optional<TenantDTO> tenantDTO = tenantService.findOne(id);
        return ResponseUtil.wrapOrNotFound(tenantDTO);
    }

    /**
     * {@code DELETE  /tenants/:id} : delete the "id" tenant.
     *
     * @param id the id of the tenantDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Tenant : {}", id);
        tenantService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code POST  /tenants/:id/switch} : Switch to a different tenant.
     * Only ADMIN users can switch tenants.
     *
     * @param id the id of the tenant to switch to.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and new JWT token,
     * or with status {@code 404 (Not Found)} if the tenant doesn't exist.
     */
    @PostMapping("/{id}/switch")
    public ResponseEntity<SwitchTenantResponse> switchTenant(@PathVariable("id") Long id) {
        LOG.debug("REST request to switch to Tenant : {}", id);

        // Verify the tenant exists and is active
        Optional<TenantDTO> tenantDTO = tenantService.findOne(id);
        if (tenantDTO.isEmpty()) {
            throw new BadRequestAlertException("Tenant not found", ENTITY_NAME, "idnotfound");
        }
        if (!Boolean.TRUE.equals(tenantDTO.get().getActive())) {
            throw new BadRequestAlertException("Tenant is not active", ENTITY_NAME, "tenantinactive");
        }

        // Get current user and authentication
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Current user not found", ENTITY_NAME, "usernotfound")
        );
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() ->
            new BadRequestAlertException("Current user ID not found", ENTITY_NAME, "useridnotfound")
        );

        // Generate new JWT token with the selected tenant
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authorities = authentication
            .getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .collect(java.util.stream.Collectors.joining(" "));

        Instant now = Instant.now();
        Instant validity = now.plus(this.tokenValidityInSeconds, ChronoUnit.SECONDS);

        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
            .issuedAt(now)
            .expiresAt(validity)
            .subject(authentication.getName())
            .claim(AUTHORITIES_CLAIM, authorities)
            .claim(USER_ID_CLAIM, userId)
            .claim(TENANT_ID_CLAIM, id);

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        String jwt = this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, builder.build())).getTokenValue();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(jwt);

        return new ResponseEntity<>(new SwitchTenantResponse(jwt, tenantDTO.get()), httpHeaders, HttpStatus.OK);
    }

    /**
     * Response object for tenant switch.
     */
    static class SwitchTenantResponse {

        private String idToken;
        private TenantDTO tenant;

        SwitchTenantResponse(String idToken, TenantDTO tenant) {
            this.idToken = idToken;
            this.tenant = tenant;
        }

        @JsonProperty("id_token")
        public String getIdToken() {
            return idToken;
        }

        public void setIdToken(String idToken) {
            this.idToken = idToken;
        }

        public TenantDTO getTenant() {
            return tenant;
        }

        public void setTenant(TenantDTO tenant) {
            this.tenant = tenant;
        }
    }
}
