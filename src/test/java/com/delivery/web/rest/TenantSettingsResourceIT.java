package com.delivery.web.rest;

import static com.delivery.domain.TenantSettingsAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Tenant;
import com.delivery.domain.TenantSettings;
import com.delivery.repository.TenantSettingsRepository;
import com.delivery.service.dto.TenantSettingsDTO;
import com.delivery.service.mapper.TenantSettingsMapper;
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
 * Integration tests for the {@link TenantSettingsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TenantSettingsResourceIT {

    private static final String DEFAULT_CURRENCY = "AAA";
    private static final String UPDATED_CURRENCY = "BBB";

    private static final String DEFAULT_TIMEZONE = "AAAAAAAAAA";
    private static final String UPDATED_TIMEZONE = "BBBBBBBBBB";

    private static final String DEFAULT_DATE_FORMAT = "AAAAAAAAAA";
    private static final String UPDATED_DATE_FORMAT = "BBBBBBBBBB";

    private static final String DEFAULT_LANGUAGE = "AAAAAAAAAA";
    private static final String UPDATED_LANGUAGE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/tenant-settings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TenantSettingsRepository tenantSettingsRepository;

    @Autowired
    private TenantSettingsMapper tenantSettingsMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTenantSettingsMockMvc;

    private TenantSettings tenantSettings;

    private TenantSettings insertedTenantSettings;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TenantSettings createEntity(EntityManager em) {
        TenantSettings tenantSettings = new TenantSettings()
            .currency(DEFAULT_CURRENCY)
            .timezone(DEFAULT_TIMEZONE)
            .dateFormat(DEFAULT_DATE_FORMAT)
            .language(DEFAULT_LANGUAGE);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        tenantSettings.setTenant(tenant);
        return tenantSettings;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TenantSettings createUpdatedEntity(EntityManager em) {
        TenantSettings updatedTenantSettings = new TenantSettings()
            .currency(UPDATED_CURRENCY)
            .timezone(UPDATED_TIMEZONE)
            .dateFormat(UPDATED_DATE_FORMAT)
            .language(UPDATED_LANGUAGE);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createUpdatedEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        updatedTenantSettings.setTenant(tenant);
        return updatedTenantSettings;
    }

    @BeforeEach
    void initTest() {
        tenantSettings = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedTenantSettings != null) {
            tenantSettingsRepository.delete(insertedTenantSettings);
            insertedTenantSettings = null;
        }
    }

    @Test
    @Transactional
    void createTenantSettings() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);
        var returnedTenantSettingsDTO = om.readValue(
            restTenantSettingsMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantSettingsDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TenantSettingsDTO.class
        );

        // Validate the TenantSettings in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTenantSettings = tenantSettingsMapper.toEntity(returnedTenantSettingsDTO);
        assertTenantSettingsUpdatableFieldsEquals(returnedTenantSettings, getPersistedTenantSettings(returnedTenantSettings));

        insertedTenantSettings = returnedTenantSettings;
    }

    @Test
    @Transactional
    void createTenantSettingsWithExistingId() throws Exception {
        // Create the TenantSettings with an existing ID
        tenantSettings.setId(1L);
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTenantSettingsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantSettingsDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllTenantSettings() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList
        restTenantSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(tenantSettings.getId().intValue())))
            .andExpect(jsonPath("$.[*].currency").value(hasItem(DEFAULT_CURRENCY)))
            .andExpect(jsonPath("$.[*].timezone").value(hasItem(DEFAULT_TIMEZONE)))
            .andExpect(jsonPath("$.[*].dateFormat").value(hasItem(DEFAULT_DATE_FORMAT)))
            .andExpect(jsonPath("$.[*].language").value(hasItem(DEFAULT_LANGUAGE)));
    }

    @Test
    @Transactional
    void getTenantSettings() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get the tenantSettings
        restTenantSettingsMockMvc
            .perform(get(ENTITY_API_URL_ID, tenantSettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(tenantSettings.getId().intValue()))
            .andExpect(jsonPath("$.currency").value(DEFAULT_CURRENCY))
            .andExpect(jsonPath("$.timezone").value(DEFAULT_TIMEZONE))
            .andExpect(jsonPath("$.dateFormat").value(DEFAULT_DATE_FORMAT))
            .andExpect(jsonPath("$.language").value(DEFAULT_LANGUAGE));
    }

    @Test
    @Transactional
    void getTenantSettingsByIdFiltering() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        Long id = tenantSettings.getId();

        defaultTenantSettingsFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultTenantSettingsFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultTenantSettingsFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByCurrencyIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where currency equals to
        defaultTenantSettingsFiltering("currency.equals=" + DEFAULT_CURRENCY, "currency.equals=" + UPDATED_CURRENCY);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByCurrencyIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where currency in
        defaultTenantSettingsFiltering("currency.in=" + DEFAULT_CURRENCY + "," + UPDATED_CURRENCY, "currency.in=" + UPDATED_CURRENCY);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByCurrencyIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where currency is not null
        defaultTenantSettingsFiltering("currency.specified=true", "currency.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantSettingsByCurrencyContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where currency contains
        defaultTenantSettingsFiltering("currency.contains=" + DEFAULT_CURRENCY, "currency.contains=" + UPDATED_CURRENCY);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByCurrencyNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where currency does not contain
        defaultTenantSettingsFiltering("currency.doesNotContain=" + UPDATED_CURRENCY, "currency.doesNotContain=" + DEFAULT_CURRENCY);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByTimezoneIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where timezone equals to
        defaultTenantSettingsFiltering("timezone.equals=" + DEFAULT_TIMEZONE, "timezone.equals=" + UPDATED_TIMEZONE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByTimezoneIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where timezone in
        defaultTenantSettingsFiltering("timezone.in=" + DEFAULT_TIMEZONE + "," + UPDATED_TIMEZONE, "timezone.in=" + UPDATED_TIMEZONE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByTimezoneIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where timezone is not null
        defaultTenantSettingsFiltering("timezone.specified=true", "timezone.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantSettingsByTimezoneContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where timezone contains
        defaultTenantSettingsFiltering("timezone.contains=" + DEFAULT_TIMEZONE, "timezone.contains=" + UPDATED_TIMEZONE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByTimezoneNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where timezone does not contain
        defaultTenantSettingsFiltering("timezone.doesNotContain=" + UPDATED_TIMEZONE, "timezone.doesNotContain=" + DEFAULT_TIMEZONE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByDateFormatIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where dateFormat equals to
        defaultTenantSettingsFiltering("dateFormat.equals=" + DEFAULT_DATE_FORMAT, "dateFormat.equals=" + UPDATED_DATE_FORMAT);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByDateFormatIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where dateFormat in
        defaultTenantSettingsFiltering(
            "dateFormat.in=" + DEFAULT_DATE_FORMAT + "," + UPDATED_DATE_FORMAT,
            "dateFormat.in=" + UPDATED_DATE_FORMAT
        );
    }

    @Test
    @Transactional
    void getAllTenantSettingsByDateFormatIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where dateFormat is not null
        defaultTenantSettingsFiltering("dateFormat.specified=true", "dateFormat.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantSettingsByDateFormatContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where dateFormat contains
        defaultTenantSettingsFiltering("dateFormat.contains=" + DEFAULT_DATE_FORMAT, "dateFormat.contains=" + UPDATED_DATE_FORMAT);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByDateFormatNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where dateFormat does not contain
        defaultTenantSettingsFiltering(
            "dateFormat.doesNotContain=" + UPDATED_DATE_FORMAT,
            "dateFormat.doesNotContain=" + DEFAULT_DATE_FORMAT
        );
    }

    @Test
    @Transactional
    void getAllTenantSettingsByLanguageIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where language equals to
        defaultTenantSettingsFiltering("language.equals=" + DEFAULT_LANGUAGE, "language.equals=" + UPDATED_LANGUAGE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByLanguageIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where language in
        defaultTenantSettingsFiltering("language.in=" + DEFAULT_LANGUAGE + "," + UPDATED_LANGUAGE, "language.in=" + UPDATED_LANGUAGE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByLanguageIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where language is not null
        defaultTenantSettingsFiltering("language.specified=true", "language.specified=false");
    }

    @Test
    @Transactional
    void getAllTenantSettingsByLanguageContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where language contains
        defaultTenantSettingsFiltering("language.contains=" + DEFAULT_LANGUAGE, "language.contains=" + UPDATED_LANGUAGE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByLanguageNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        // Get all the tenantSettingsList where language does not contain
        defaultTenantSettingsFiltering("language.doesNotContain=" + UPDATED_LANGUAGE, "language.doesNotContain=" + DEFAULT_LANGUAGE);
    }

    @Test
    @Transactional
    void getAllTenantSettingsByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenantSettingsRepository.saveAndFlush(tenantSettings);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        tenantSettings.setTenant(tenant);
        tenantSettingsRepository.saveAndFlush(tenantSettings);
        Long tenantId = tenant.getId();
        // Get all the tenantSettingsList where tenant equals to tenantId
        defaultTenantSettingsShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the tenantSettingsList where tenant equals to (tenantId + 1)
        defaultTenantSettingsShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    private void defaultTenantSettingsFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultTenantSettingsShouldBeFound(shouldBeFound);
        defaultTenantSettingsShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultTenantSettingsShouldBeFound(String filter) throws Exception {
        restTenantSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(tenantSettings.getId().intValue())))
            .andExpect(jsonPath("$.[*].currency").value(hasItem(DEFAULT_CURRENCY)))
            .andExpect(jsonPath("$.[*].timezone").value(hasItem(DEFAULT_TIMEZONE)))
            .andExpect(jsonPath("$.[*].dateFormat").value(hasItem(DEFAULT_DATE_FORMAT)))
            .andExpect(jsonPath("$.[*].language").value(hasItem(DEFAULT_LANGUAGE)));

        // Check, that the count call also returns 1
        restTenantSettingsMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultTenantSettingsShouldNotBeFound(String filter) throws Exception {
        restTenantSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restTenantSettingsMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingTenantSettings() throws Exception {
        // Get the tenantSettings
        restTenantSettingsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTenantSettings() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the tenantSettings
        TenantSettings updatedTenantSettings = tenantSettingsRepository.findById(tenantSettings.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTenantSettings are not directly saved in db
        em.detach(updatedTenantSettings);
        updatedTenantSettings
            .currency(UPDATED_CURRENCY)
            .timezone(UPDATED_TIMEZONE)
            .dateFormat(UPDATED_DATE_FORMAT)
            .language(UPDATED_LANGUAGE);
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(updatedTenantSettings);

        restTenantSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, tenantSettingsDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(tenantSettingsDTO))
            )
            .andExpect(status().isOk());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTenantSettingsToMatchAllProperties(updatedTenantSettings);
    }

    @Test
    @Transactional
    void putNonExistingTenantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenantSettings.setId(longCount.incrementAndGet());

        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTenantSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, tenantSettingsDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(tenantSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTenantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenantSettings.setId(longCount.incrementAndGet());

        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(tenantSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTenantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenantSettings.setId(longCount.incrementAndGet());

        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantSettingsMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(tenantSettingsDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTenantSettingsWithPatch() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the tenantSettings using partial update
        TenantSettings partialUpdatedTenantSettings = new TenantSettings();
        partialUpdatedTenantSettings.setId(tenantSettings.getId());

        partialUpdatedTenantSettings
            .currency(UPDATED_CURRENCY)
            .timezone(UPDATED_TIMEZONE)
            .dateFormat(UPDATED_DATE_FORMAT)
            .language(UPDATED_LANGUAGE);

        restTenantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTenantSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTenantSettings))
            )
            .andExpect(status().isOk());

        // Validate the TenantSettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTenantSettingsUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTenantSettings, tenantSettings),
            getPersistedTenantSettings(tenantSettings)
        );
    }

    @Test
    @Transactional
    void fullUpdateTenantSettingsWithPatch() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the tenantSettings using partial update
        TenantSettings partialUpdatedTenantSettings = new TenantSettings();
        partialUpdatedTenantSettings.setId(tenantSettings.getId());

        partialUpdatedTenantSettings
            .currency(UPDATED_CURRENCY)
            .timezone(UPDATED_TIMEZONE)
            .dateFormat(UPDATED_DATE_FORMAT)
            .language(UPDATED_LANGUAGE);

        restTenantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTenantSettings.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTenantSettings))
            )
            .andExpect(status().isOk());

        // Validate the TenantSettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTenantSettingsUpdatableFieldsEquals(partialUpdatedTenantSettings, getPersistedTenantSettings(partialUpdatedTenantSettings));
    }

    @Test
    @Transactional
    void patchNonExistingTenantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenantSettings.setId(longCount.incrementAndGet());

        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTenantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, tenantSettingsDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(tenantSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTenantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenantSettings.setId(longCount.incrementAndGet());

        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(tenantSettingsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTenantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        tenantSettings.setId(longCount.incrementAndGet());

        // Create the TenantSettings
        TenantSettingsDTO tenantSettingsDTO = tenantSettingsMapper.toDto(tenantSettings);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTenantSettingsMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(tenantSettingsDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TenantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTenantSettings() throws Exception {
        // Initialize the database
        insertedTenantSettings = tenantSettingsRepository.saveAndFlush(tenantSettings);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the tenantSettings
        restTenantSettingsMockMvc
            .perform(delete(ENTITY_API_URL_ID, tenantSettings.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return tenantSettingsRepository.count();
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

    protected TenantSettings getPersistedTenantSettings(TenantSettings tenantSettings) {
        return tenantSettingsRepository.findById(tenantSettings.getId()).orElseThrow();
    }

    protected void assertPersistedTenantSettingsToMatchAllProperties(TenantSettings expectedTenantSettings) {
        assertTenantSettingsAllPropertiesEquals(expectedTenantSettings, getPersistedTenantSettings(expectedTenantSettings));
    }

    protected void assertPersistedTenantSettingsToMatchUpdatableProperties(TenantSettings expectedTenantSettings) {
        assertTenantSettingsAllUpdatablePropertiesEquals(expectedTenantSettings, getPersistedTenantSettings(expectedTenantSettings));
    }
}
