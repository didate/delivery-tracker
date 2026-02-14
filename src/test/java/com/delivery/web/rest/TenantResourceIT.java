package com.delivery.web.rest;

import static com.delivery.domain.TenantAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Tenant;
import com.delivery.repository.TenantRepository;
import com.delivery.service.dto.TenantDTO;
import com.delivery.service.mapper.TenantMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TenantResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TenantResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE = "AAAAAAAAAA";
    private static final String UPDATED_PHONE = "BBBBBBBBBB";

    private static final String DEFAULT_ADDRESS = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS = "BBBBBBBBBB";

    private static final String DEFAULT_LOGO_URL = "AAAAAAAAAA";
    private static final String UPDATED_LOGO_URL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/tenants";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private TenantMapper tenantMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTenantMockMvc;

    private Tenant tenant;

    private Tenant insertedTenant;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Tenant createEntity() {
        return new Tenant()
            .code(DEFAULT_CODE)
            .name(DEFAULT_NAME)
            .email(DEFAULT_EMAIL)
            .phone(DEFAULT_PHONE)
            .address(DEFAULT_ADDRESS)
            .logoUrl(DEFAULT_LOGO_URL)
            .active(DEFAULT_ACTIVE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Tenant createUpdatedEntity() {
        return new Tenant()
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .address(UPDATED_ADDRESS)
            .logoUrl(UPDATED_LOGO_URL)
            .active(UPDATED_ACTIVE);
    }

    @BeforeEach
    void initTest() {
        tenant = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTenant != null) {
            tenantRepository.delete(insertedTenant);
            insertedTenant = null;
        }
    }

    @Test
    @Transactional
    void createTenant() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);
        var returnedTenantDTO = om.readValue(
            restTenantMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TenantDTO.class
        );

        // Validate the Tenant in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTenant = tenantMapper.toEntity(returnedTenantDTO);
        assertTenantUpdatableFieldsEquals(returnedTenant, getPersistedTenant(returnedTenant));

        insertedTenant = returnedTenant;
    }

    @Test
    @Transactional
    void createTenantWithExistingId() throws Exception {
        // Create the Tenant with an existing ID
        tenant.setId(1L);
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTenantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        tenant.setCode(null);

        // Create the Tenant, which fails.
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        restTenantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        tenant.setName(null);

        // Create the Tenant, which fails.
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        restTenantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEmailIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        tenant.setEmail(null);

        // Create the Tenant, which fails.
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        restTenantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        tenant.setActive(null);

        // Create the Tenant, which fails.
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        restTenantMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTenants() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList
        restTenantMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(tenant.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].address").value(hasItem(DEFAULT_ADDRESS)))
            .andExpect(jsonPath("$.[*].logoUrl").value(hasItem(DEFAULT_LOGO_URL)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getTenant() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get the tenant
        restTenantMockMvc
            .perform(get(ENTITY_API_URL_ID, tenant.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(tenant.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            .andExpect(jsonPath("$.phone").value(DEFAULT_PHONE))
            .andExpect(jsonPath("$.address").value(DEFAULT_ADDRESS))
            .andExpect(jsonPath("$.logoUrl").value(DEFAULT_LOGO_URL))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getTenantsByIdFiltering() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        Long id = tenant.getId();

        defaultTenantFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultTenantFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultTenantFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllTenantsByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where code equals to
        defaultTenantFiltering("code.equals=" + DEFAULT_CODE, "code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllTenantsByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where code in
        defaultTenantFiltering("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE, "code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllTenantsByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where code is not null
        defaultTenantFiltering("code.specified=true", "code.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantsByCodeContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where code contains
        defaultTenantFiltering("code.contains=" + DEFAULT_CODE, "code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllTenantsByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where code does not contain
        defaultTenantFiltering("code.doesNotContain=" + UPDATED_CODE, "code.doesNotContain=" + DEFAULT_CODE);
    }

    @Test
    @Transactional
    void getAllTenantsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where name equals to
        defaultTenantFiltering("name.equals=" + DEFAULT_NAME, "name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTenantsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where name in
        defaultTenantFiltering("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME, "name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTenantsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where name is not null
        defaultTenantFiltering("name.specified=true", "name.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantsByNameContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where name contains
        defaultTenantFiltering("name.contains=" + DEFAULT_NAME, "name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTenantsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where name does not contain
        defaultTenantFiltering("name.doesNotContain=" + UPDATED_NAME, "name.doesNotContain=" + DEFAULT_NAME);
    }

    @Test
    @Transactional
    void getAllTenantsByEmailIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where email equals to
        defaultTenantFiltering("email.equals=" + DEFAULT_EMAIL, "email.equals=" + UPDATED_EMAIL);
    }

    @Test
    @Transactional
    void getAllTenantsByEmailIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where email in
        defaultTenantFiltering("email.in=" + DEFAULT_EMAIL + "," + UPDATED_EMAIL, "email.in=" + UPDATED_EMAIL);
    }

    @Test
    @Transactional
    void getAllTenantsByEmailIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where email is not null
        defaultTenantFiltering("email.specified=true", "email.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantsByEmailContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where email contains
        defaultTenantFiltering("email.contains=" + DEFAULT_EMAIL, "email.contains=" + UPDATED_EMAIL);
    }

    @Test
    @Transactional
    void getAllTenantsByEmailNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where email does not contain
        defaultTenantFiltering("email.doesNotContain=" + UPDATED_EMAIL, "email.doesNotContain=" + DEFAULT_EMAIL);
    }

    @Test
    @Transactional
    void getAllTenantsByPhoneIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where phone equals to
        defaultTenantFiltering("phone.equals=" + DEFAULT_PHONE, "phone.equals=" + UPDATED_PHONE);
    }

    @Test
    @Transactional
    void getAllTenantsByPhoneIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where phone in
        defaultTenantFiltering("phone.in=" + DEFAULT_PHONE + "," + UPDATED_PHONE, "phone.in=" + UPDATED_PHONE);
    }

    @Test
    @Transactional
    void getAllTenantsByPhoneIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where phone is not null
        defaultTenantFiltering("phone.specified=true", "phone.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantsByPhoneContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where phone contains
        defaultTenantFiltering("phone.contains=" + DEFAULT_PHONE, "phone.contains=" + UPDATED_PHONE);
    }

    @Test
    @Transactional
    void getAllTenantsByPhoneNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where phone does not contain
        defaultTenantFiltering("phone.doesNotContain=" + UPDATED_PHONE, "phone.doesNotContain=" + DEFAULT_PHONE);
    }

    @Test
    @Transactional
    void getAllTenantsByLogoUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where logoUrl equals to
        defaultTenantFiltering("logoUrl.equals=" + DEFAULT_LOGO_URL, "logoUrl.equals=" + UPDATED_LOGO_URL);
    }

    @Test
    @Transactional
    void getAllTenantsByLogoUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where logoUrl in
        defaultTenantFiltering("logoUrl.in=" + DEFAULT_LOGO_URL + "," + UPDATED_LOGO_URL, "logoUrl.in=" + UPDATED_LOGO_URL);
    }

    @Test
    @Transactional
    void getAllTenantsByLogoUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where logoUrl is not null
        defaultTenantFiltering("logoUrl.specified=true", "logoUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantsByLogoUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where logoUrl contains
        defaultTenantFiltering("logoUrl.contains=" + DEFAULT_LOGO_URL, "logoUrl.contains=" + UPDATED_LOGO_URL);
    }

    @Test
    @Transactional
    void getAllTenantsByLogoUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where logoUrl does not contain
        defaultTenantFiltering("logoUrl.doesNotContain=" + UPDATED_LOGO_URL, "logoUrl.doesNotContain=" + DEFAULT_LOGO_URL);
    }

    @Test
    @Transactional
    void getAllTenantsByActiveIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where active equals to
        defaultTenantFiltering("active.equals=" + DEFAULT_ACTIVE, "active.equals=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllTenantsByActiveIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where active in
        defaultTenantFiltering("active.in=" + DEFAULT_ACTIVE + "," + UPDATED_ACTIVE, "active.in=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllTenantsByActiveIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        // Get all the tenantList where active is not null
        defaultTenantFiltering("active.specified=true", "active.specified=false");
    }

    private void defaultTenantFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultTenantShouldBeFound(shouldBeFound);
        defaultTenantShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultTenantShouldBeFound(String filter) throws Exception {
        restTenantMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(tenant.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].address").value(hasItem(DEFAULT_ADDRESS)))
            .andExpect(jsonPath("$.[*].logoUrl").value(hasItem(DEFAULT_LOGO_URL)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));

        // Check, that the count call also returns 1
        restTenantMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultTenantShouldNotBeFound(String filter) throws Exception {
        restTenantMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restTenantMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingTenant() throws Exception {
        // Get the tenant
        restTenantMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTenant() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the tenant
        Tenant updatedTenant = tenantRepository.findById(tenant.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTenant are not directly saved in db
        em.detach(updatedTenant);
        updatedTenant
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .address(UPDATED_ADDRESS)
            .logoUrl(UPDATED_LOGO_URL)
            .active(UPDATED_ACTIVE);
        TenantDTO tenantDTO = tenantMapper.toDto(updatedTenant);

        restTenantMockMvc
            .perform(
                put(ENTITY_API_URL_ID, tenantDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO))
            )
            .andExpect(status().isOk());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTenantToMatchAllProperties(updatedTenant);
    }

    @Test
    @Transactional
    void putNonExistingTenant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenant.setId(longCount.incrementAndGet());

        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTenantMockMvc
            .perform(
                put(ENTITY_API_URL_ID, tenantDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTenant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenant.setId(longCount.incrementAndGet());

        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(tenantDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTenant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenant.setId(longCount.incrementAndGet());

        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTenantWithPatch() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the tenant using partial update
        Tenant partialUpdatedTenant = new Tenant();
        partialUpdatedTenant.setId(tenant.getId());

        partialUpdatedTenant
            .name(UPDATED_NAME)
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .address(UPDATED_ADDRESS)
            .logoUrl(UPDATED_LOGO_URL);

        restTenantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTenant.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTenant))
            )
            .andExpect(status().isOk());

        // Validate the Tenant in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTenantUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedTenant, tenant), getPersistedTenant(tenant));
    }

    @Test
    @Transactional
    void fullUpdateTenantWithPatch() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the tenant using partial update
        Tenant partialUpdatedTenant = new Tenant();
        partialUpdatedTenant.setId(tenant.getId());

        partialUpdatedTenant
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .email(UPDATED_EMAIL)
            .phone(UPDATED_PHONE)
            .address(UPDATED_ADDRESS)
            .logoUrl(UPDATED_LOGO_URL)
            .active(UPDATED_ACTIVE);

        restTenantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTenant.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTenant))
            )
            .andExpect(status().isOk());

        // Validate the Tenant in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTenantUpdatableFieldsEquals(partialUpdatedTenant, getPersistedTenant(partialUpdatedTenant));
    }

    @Test
    @Transactional
    void patchNonExistingTenant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenant.setId(longCount.incrementAndGet());

        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTenantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, tenantDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(tenantDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTenant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenant.setId(longCount.incrementAndGet());

        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(tenantDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTenant() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenant.setId(longCount.incrementAndGet());

        // Create the Tenant
        TenantDTO tenantDTO = tenantMapper.toDto(tenant);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(tenantDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Tenant in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTenant() throws Exception {
        // Initialize the database
        insertedTenant = tenantRepository.saveAndFlush(tenant);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the tenant
        restTenantMockMvc
            .perform(delete(ENTITY_API_URL_ID, tenant.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return tenantRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Tenant getPersistedTenant(Tenant tenant) {
        return tenantRepository.findById(tenant.getId()).orElseThrow();
    }

    protected void assertPersistedTenantToMatchAllProperties(Tenant expectedTenant) {
        assertTenantAllPropertiesEquals(expectedTenant, getPersistedTenant(expectedTenant));
    }

    protected void assertPersistedTenantToMatchUpdatableProperties(Tenant expectedTenant) {
        assertTenantAllUpdatablePropertiesEquals(expectedTenant, getPersistedTenant(expectedTenant));
    }
}
