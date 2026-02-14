package com.delivery.web.rest;

import static com.delivery.domain.RoundAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Driver;
import com.delivery.domain.Round;
import com.delivery.domain.Tenant;
import com.delivery.domain.enumeration.RoundStatus;
import com.delivery.repository.RoundRepository;
import com.delivery.service.dto.RoundDTO;
import com.delivery.service.mapper.RoundMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link RoundResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RoundResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_ROUND_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_ROUND_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_ROUND_DATE = LocalDate.ofEpochDay(-1L);

    private static final RoundStatus DEFAULT_STATUS = RoundStatus.PLANNED;
    private static final RoundStatus UPDATED_STATUS = RoundStatus.IN_PROGRESS;

    private static final Instant DEFAULT_START_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_START_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_END_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_END_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/rounds";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RoundRepository roundRepository;

    @Autowired
    private RoundMapper roundMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRoundMockMvc;

    private Round round;

    private Round insertedRound;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Round createEntity(EntityManager em) {
        Round round = new Round()
            .name(DEFAULT_NAME)
            .roundDate(DEFAULT_ROUND_DATE)
            .status(DEFAULT_STATUS)
            .startTime(DEFAULT_START_TIME)
            .endTime(DEFAULT_END_TIME)
            .notes(DEFAULT_NOTES);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        round.setTenant(tenant);
        // Add required entity
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            driver = DriverResourceIT.createEntity(em);
            em.persist(driver);
            em.flush();
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        round.setDriver(driver);
        return round;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Round createUpdatedEntity(EntityManager em) {
        Round updatedRound = new Round()
            .name(UPDATED_NAME)
            .roundDate(UPDATED_ROUND_DATE)
            .status(UPDATED_STATUS)
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME)
            .notes(UPDATED_NOTES);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createUpdatedEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        updatedRound.setTenant(tenant);
        // Add required entity
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            driver = DriverResourceIT.createUpdatedEntity(em);
            em.persist(driver);
            em.flush();
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        updatedRound.setDriver(driver);
        return updatedRound;
    }

    @BeforeEach
    void initTest() {
        round = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedRound != null) {
            roundRepository.delete(insertedRound);
            insertedRound = null;
        }
    }

    @Test
    @Transactional
    void createRound() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);
        var returnedRoundDTO = om.readValue(
            restRoundMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RoundDTO.class
        );

        // Validate the Round in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRound = roundMapper.toEntity(returnedRoundDTO);
        assertRoundUpdatableFieldsEquals(returnedRound, getPersistedRound(returnedRound));

        insertedRound = returnedRound;
    }

    @Test
    @Transactional
    void createRoundWithExistingId() throws Exception {
        // Create the Round with an existing ID
        round.setId(1L);
        RoundDTO roundDTO = roundMapper.toDto(round);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRoundMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        round.setName(null);

        // Create the Round, which fails.
        RoundDTO roundDTO = roundMapper.toDto(round);

        restRoundMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRoundDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        round.setRoundDate(null);

        // Create the Round, which fails.
        RoundDTO roundDTO = roundMapper.toDto(round);

        restRoundMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        round.setStatus(null);

        // Create the Round, which fails.
        RoundDTO roundDTO = roundMapper.toDto(round);

        restRoundMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRounds() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList
        restRoundMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(round.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].roundDate").value(hasItem(DEFAULT_ROUND_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].startTime").value(hasItem(DEFAULT_START_TIME.toString())))
            .andExpect(jsonPath("$.[*].endTime").value(hasItem(DEFAULT_END_TIME.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getRound() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get the round
        restRoundMockMvc
            .perform(get(ENTITY_API_URL_ID, round.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(round.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.roundDate").value(DEFAULT_ROUND_DATE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.startTime").value(DEFAULT_START_TIME.toString()))
            .andExpect(jsonPath("$.endTime").value(DEFAULT_END_TIME.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getRoundsByIdFiltering() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        Long id = round.getId();

        defaultRoundFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultRoundFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultRoundFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllRoundsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where name equals to
        defaultRoundFiltering("name.equals=" + DEFAULT_NAME, "name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllRoundsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where name in
        defaultRoundFiltering("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME, "name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllRoundsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where name is not null
        defaultRoundFiltering("name.specified=true", "name.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundsByNameContainsSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where name contains
        defaultRoundFiltering("name.contains=" + DEFAULT_NAME, "name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllRoundsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where name does not contain
        defaultRoundFiltering("name.doesNotContain=" + UPDATED_NAME, "name.doesNotContain=" + DEFAULT_NAME);
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate equals to
        defaultRoundFiltering("roundDate.equals=" + DEFAULT_ROUND_DATE, "roundDate.equals=" + UPDATED_ROUND_DATE);
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate in
        defaultRoundFiltering("roundDate.in=" + DEFAULT_ROUND_DATE + "," + UPDATED_ROUND_DATE, "roundDate.in=" + UPDATED_ROUND_DATE);
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate is not null
        defaultRoundFiltering("roundDate.specified=true", "roundDate.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate is greater than or equal to
        defaultRoundFiltering("roundDate.greaterThanOrEqual=" + DEFAULT_ROUND_DATE, "roundDate.greaterThanOrEqual=" + UPDATED_ROUND_DATE);
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate is less than or equal to
        defaultRoundFiltering("roundDate.lessThanOrEqual=" + DEFAULT_ROUND_DATE, "roundDate.lessThanOrEqual=" + SMALLER_ROUND_DATE);
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate is less than
        defaultRoundFiltering("roundDate.lessThan=" + UPDATED_ROUND_DATE, "roundDate.lessThan=" + DEFAULT_ROUND_DATE);
    }

    @Test
    @Transactional
    void getAllRoundsByRoundDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where roundDate is greater than
        defaultRoundFiltering("roundDate.greaterThan=" + SMALLER_ROUND_DATE, "roundDate.greaterThan=" + DEFAULT_ROUND_DATE);
    }

    @Test
    @Transactional
    void getAllRoundsByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where status equals to
        defaultRoundFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllRoundsByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where status in
        defaultRoundFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllRoundsByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where status is not null
        defaultRoundFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundsByStartTimeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where startTime equals to
        defaultRoundFiltering("startTime.equals=" + DEFAULT_START_TIME, "startTime.equals=" + UPDATED_START_TIME);
    }

    @Test
    @Transactional
    void getAllRoundsByStartTimeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where startTime in
        defaultRoundFiltering("startTime.in=" + DEFAULT_START_TIME + "," + UPDATED_START_TIME, "startTime.in=" + UPDATED_START_TIME);
    }

    @Test
    @Transactional
    void getAllRoundsByStartTimeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where startTime is not null
        defaultRoundFiltering("startTime.specified=true", "startTime.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundsByEndTimeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where endTime equals to
        defaultRoundFiltering("endTime.equals=" + DEFAULT_END_TIME, "endTime.equals=" + UPDATED_END_TIME);
    }

    @Test
    @Transactional
    void getAllRoundsByEndTimeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where endTime in
        defaultRoundFiltering("endTime.in=" + DEFAULT_END_TIME + "," + UPDATED_END_TIME, "endTime.in=" + UPDATED_END_TIME);
    }

    @Test
    @Transactional
    void getAllRoundsByEndTimeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        // Get all the roundList where endTime is not null
        defaultRoundFiltering("endTime.specified=true", "endTime.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundsByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            roundRepository.saveAndFlush(round);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        round.setTenant(tenant);
        roundRepository.saveAndFlush(round);
        Long tenantId = tenant.getId();
        // Get all the roundList where tenant equals to tenantId
        defaultRoundShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the roundList where tenant equals to (tenantId + 1)
        defaultRoundShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    @Test
    @Transactional
    void getAllRoundsByDriverIsEqualToSomething() throws Exception {
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            roundRepository.saveAndFlush(round);
            driver = DriverResourceIT.createEntity(em);
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        em.persist(driver);
        em.flush();
        round.setDriver(driver);
        roundRepository.saveAndFlush(round);
        Long driverId = driver.getId();
        // Get all the roundList where driver equals to driverId
        defaultRoundShouldBeFound("driverId.equals=" + driverId);

        // Get all the roundList where driver equals to (driverId + 1)
        defaultRoundShouldNotBeFound("driverId.equals=" + (driverId + 1));
    }

    private void defaultRoundFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultRoundShouldBeFound(shouldBeFound);
        defaultRoundShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultRoundShouldBeFound(String filter) throws Exception {
        restRoundMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(round.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].roundDate").value(hasItem(DEFAULT_ROUND_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].startTime").value(hasItem(DEFAULT_START_TIME.toString())))
            .andExpect(jsonPath("$.[*].endTime").value(hasItem(DEFAULT_END_TIME.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restRoundMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultRoundShouldNotBeFound(String filter) throws Exception {
        restRoundMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restRoundMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingRound() throws Exception {
        // Get the round
        restRoundMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRound() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the round
        Round updatedRound = roundRepository.findById(round.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRound are not directly saved in db
        em.detach(updatedRound);
        updatedRound
            .name(UPDATED_NAME)
            .roundDate(UPDATED_ROUND_DATE)
            .status(UPDATED_STATUS)
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME)
            .notes(UPDATED_NOTES);
        RoundDTO roundDTO = roundMapper.toDto(updatedRound);

        restRoundMockMvc
            .perform(
                put(ENTITY_API_URL_ID, roundDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO))
            )
            .andExpect(status().isOk());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRoundToMatchAllProperties(updatedRound);
    }

    @Test
    @Transactional
    void putNonExistingRound() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        round.setId(longCount.incrementAndGet());

        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRoundMockMvc
            .perform(
                put(ENTITY_API_URL_ID, roundDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRound() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        round.setId(longCount.incrementAndGet());

        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roundDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRound() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        round.setId(longCount.incrementAndGet());

        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRoundWithPatch() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the round using partial update
        Round partialUpdatedRound = new Round();
        partialUpdatedRound.setId(round.getId());

        partialUpdatedRound.status(UPDATED_STATUS).endTime(UPDATED_END_TIME).notes(UPDATED_NOTES);

        restRoundMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRound.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRound))
            )
            .andExpect(status().isOk());

        // Validate the Round in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRoundUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedRound, round), getPersistedRound(round));
    }

    @Test
    @Transactional
    void fullUpdateRoundWithPatch() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the round using partial update
        Round partialUpdatedRound = new Round();
        partialUpdatedRound.setId(round.getId());

        partialUpdatedRound
            .name(UPDATED_NAME)
            .roundDate(UPDATED_ROUND_DATE)
            .status(UPDATED_STATUS)
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME)
            .notes(UPDATED_NOTES);

        restRoundMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRound.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRound))
            )
            .andExpect(status().isOk());

        // Validate the Round in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRoundUpdatableFieldsEquals(partialUpdatedRound, getPersistedRound(partialUpdatedRound));
    }

    @Test
    @Transactional
    void patchNonExistingRound() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        round.setId(longCount.incrementAndGet());

        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRoundMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, roundDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(roundDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRound() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        round.setId(longCount.incrementAndGet());

        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(roundDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRound() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        round.setId(longCount.incrementAndGet());

        // Create the Round
        RoundDTO roundDTO = roundMapper.toDto(round);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(roundDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Round in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRound() throws Exception {
        // Initialize the database
        insertedRound = roundRepository.saveAndFlush(round);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the round
        restRoundMockMvc
            .perform(delete(ENTITY_API_URL_ID, round.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return roundRepository.count();
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

    protected Round getPersistedRound(Round round) {
        return roundRepository.findById(round.getId()).orElseThrow();
    }

    protected void assertPersistedRoundToMatchAllProperties(Round expectedRound) {
        assertRoundAllPropertiesEquals(expectedRound, getPersistedRound(expectedRound));
    }

    protected void assertPersistedRoundToMatchUpdatableProperties(Round expectedRound) {
        assertRoundAllUpdatablePropertiesEquals(expectedRound, getPersistedRound(expectedRound));
    }
}
