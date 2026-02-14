package com.delivery.web.rest;

import static com.delivery.domain.RoundCustomerAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Customer;
import com.delivery.domain.Round;
import com.delivery.domain.RoundCustomer;
import com.delivery.repository.RoundCustomerRepository;
import com.delivery.service.dto.RoundCustomerDTO;
import com.delivery.service.mapper.RoundCustomerMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
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
 * Integration tests for the {@link RoundCustomerResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RoundCustomerResourceIT {

    private static final Integer DEFAULT_SEQUENCE_ORDER = 1;
    private static final Integer UPDATED_SEQUENCE_ORDER = 2;
    private static final Integer SMALLER_SEQUENCE_ORDER = 1 - 1;

    private static final Boolean DEFAULT_VISITED = false;
    private static final Boolean UPDATED_VISITED = true;

    private static final Instant DEFAULT_VISIT_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_VISIT_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/round-customers";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RoundCustomerRepository roundCustomerRepository;

    @Autowired
    private RoundCustomerMapper roundCustomerMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRoundCustomerMockMvc;

    private RoundCustomer roundCustomer;

    private RoundCustomer insertedRoundCustomer;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RoundCustomer createEntity(EntityManager em) {
        RoundCustomer roundCustomer = new RoundCustomer()
            .sequenceOrder(DEFAULT_SEQUENCE_ORDER)
            .visited(DEFAULT_VISITED)
            .visitTime(DEFAULT_VISIT_TIME)
            .notes(DEFAULT_NOTES);
        // Add required entity
        Round round;
        if (TestUtil.findAll(em, Round.class).isEmpty()) {
            round = RoundResourceIT.createEntity(em);
            em.persist(round);
            em.flush();
        } else {
            round = TestUtil.findAll(em, Round.class).get(0);
        }
        roundCustomer.setRound(round);
        // Add required entity
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            customer = CustomerResourceIT.createEntity(em);
            em.persist(customer);
            em.flush();
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        roundCustomer.setCustomer(customer);
        return roundCustomer;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RoundCustomer createUpdatedEntity(EntityManager em) {
        RoundCustomer updatedRoundCustomer = new RoundCustomer()
            .sequenceOrder(UPDATED_SEQUENCE_ORDER)
            .visited(UPDATED_VISITED)
            .visitTime(UPDATED_VISIT_TIME)
            .notes(UPDATED_NOTES);
        // Add required entity
        Round round;
        if (TestUtil.findAll(em, Round.class).isEmpty()) {
            round = RoundResourceIT.createUpdatedEntity(em);
            em.persist(round);
            em.flush();
        } else {
            round = TestUtil.findAll(em, Round.class).get(0);
        }
        updatedRoundCustomer.setRound(round);
        // Add required entity
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            customer = CustomerResourceIT.createUpdatedEntity(em);
            em.persist(customer);
            em.flush();
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        updatedRoundCustomer.setCustomer(customer);
        return updatedRoundCustomer;
    }

    @BeforeEach
    void initTest() {
        roundCustomer = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedRoundCustomer != null) {
            roundCustomerRepository.delete(insertedRoundCustomer);
            insertedRoundCustomer = null;
        }
    }

    @Test
    @Transactional
    void createRoundCustomer() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);
        var returnedRoundCustomerDTO = om.readValue(
            restRoundCustomerMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundCustomerDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RoundCustomerDTO.class
        );

        // Validate the RoundCustomer in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRoundCustomer = roundCustomerMapper.toEntity(returnedRoundCustomerDTO);
        assertRoundCustomerUpdatableFieldsEquals(returnedRoundCustomer, getPersistedRoundCustomer(returnedRoundCustomer));

        insertedRoundCustomer = returnedRoundCustomer;
    }

    @Test
    @Transactional
    void createRoundCustomerWithExistingId() throws Exception {
        // Create the RoundCustomer with an existing ID
        roundCustomer.setId(1L);
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRoundCustomerMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundCustomerDTO)))
            .andExpect(status().isBadRequest());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSequenceOrderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        roundCustomer.setSequenceOrder(null);

        // Create the RoundCustomer, which fails.
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        restRoundCustomerMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundCustomerDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRoundCustomers() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList
        restRoundCustomerMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(roundCustomer.getId().intValue())))
            .andExpect(jsonPath("$.[*].sequenceOrder").value(hasItem(DEFAULT_SEQUENCE_ORDER)))
            .andExpect(jsonPath("$.[*].visited").value(hasItem(DEFAULT_VISITED)))
            .andExpect(jsonPath("$.[*].visitTime").value(hasItem(DEFAULT_VISIT_TIME.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getRoundCustomer() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get the roundCustomer
        restRoundCustomerMockMvc
            .perform(get(ENTITY_API_URL_ID, roundCustomer.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(roundCustomer.getId().intValue()))
            .andExpect(jsonPath("$.sequenceOrder").value(DEFAULT_SEQUENCE_ORDER))
            .andExpect(jsonPath("$.visited").value(DEFAULT_VISITED))
            .andExpect(jsonPath("$.visitTime").value(DEFAULT_VISIT_TIME.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getRoundCustomersByIdFiltering() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        Long id = roundCustomer.getId();

        defaultRoundCustomerFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultRoundCustomerFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultRoundCustomerFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder equals to
        defaultRoundCustomerFiltering("sequenceOrder.equals=" + DEFAULT_SEQUENCE_ORDER, "sequenceOrder.equals=" + UPDATED_SEQUENCE_ORDER);
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder in
        defaultRoundCustomerFiltering(
            "sequenceOrder.in=" + DEFAULT_SEQUENCE_ORDER + "," + UPDATED_SEQUENCE_ORDER,
            "sequenceOrder.in=" + UPDATED_SEQUENCE_ORDER
        );
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder is not null
        defaultRoundCustomerFiltering("sequenceOrder.specified=true", "sequenceOrder.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder is greater than or equal to
        defaultRoundCustomerFiltering(
            "sequenceOrder.greaterThanOrEqual=" + DEFAULT_SEQUENCE_ORDER,
            "sequenceOrder.greaterThanOrEqual=" + UPDATED_SEQUENCE_ORDER
        );
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder is less than or equal to
        defaultRoundCustomerFiltering(
            "sequenceOrder.lessThanOrEqual=" + DEFAULT_SEQUENCE_ORDER,
            "sequenceOrder.lessThanOrEqual=" + SMALLER_SEQUENCE_ORDER
        );
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder is less than
        defaultRoundCustomerFiltering(
            "sequenceOrder.lessThan=" + UPDATED_SEQUENCE_ORDER,
            "sequenceOrder.lessThan=" + DEFAULT_SEQUENCE_ORDER
        );
    }

    @Test
    @Transactional
    void getAllRoundCustomersBySequenceOrderIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where sequenceOrder is greater than
        defaultRoundCustomerFiltering(
            "sequenceOrder.greaterThan=" + SMALLER_SEQUENCE_ORDER,
            "sequenceOrder.greaterThan=" + DEFAULT_SEQUENCE_ORDER
        );
    }

    @Test
    @Transactional
    void getAllRoundCustomersByVisitedIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where visited equals to
        defaultRoundCustomerFiltering("visited.equals=" + DEFAULT_VISITED, "visited.equals=" + UPDATED_VISITED);
    }

    @Test
    @Transactional
    void getAllRoundCustomersByVisitedIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where visited in
        defaultRoundCustomerFiltering("visited.in=" + DEFAULT_VISITED + "," + UPDATED_VISITED, "visited.in=" + UPDATED_VISITED);
    }

    @Test
    @Transactional
    void getAllRoundCustomersByVisitedIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where visited is not null
        defaultRoundCustomerFiltering("visited.specified=true", "visited.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundCustomersByVisitTimeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where visitTime equals to
        defaultRoundCustomerFiltering("visitTime.equals=" + DEFAULT_VISIT_TIME, "visitTime.equals=" + UPDATED_VISIT_TIME);
    }

    @Test
    @Transactional
    void getAllRoundCustomersByVisitTimeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where visitTime in
        defaultRoundCustomerFiltering(
            "visitTime.in=" + DEFAULT_VISIT_TIME + "," + UPDATED_VISIT_TIME,
            "visitTime.in=" + UPDATED_VISIT_TIME
        );
    }

    @Test
    @Transactional
    void getAllRoundCustomersByVisitTimeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        // Get all the roundCustomerList where visitTime is not null
        defaultRoundCustomerFiltering("visitTime.specified=true", "visitTime.specified=false");
    }

    @Test
    @Transactional
    void getAllRoundCustomersByRoundIsEqualToSomething() throws Exception {
        Round round;
        if (TestUtil.findAll(em, Round.class).isEmpty()) {
            roundCustomerRepository.saveAndFlush(roundCustomer);
            round = RoundResourceIT.createEntity(em);
        } else {
            round = TestUtil.findAll(em, Round.class).get(0);
        }
        em.persist(round);
        em.flush();
        roundCustomer.setRound(round);
        roundCustomerRepository.saveAndFlush(roundCustomer);
        Long roundId = round.getId();
        // Get all the roundCustomerList where round equals to roundId
        defaultRoundCustomerShouldBeFound("roundId.equals=" + roundId);

        // Get all the roundCustomerList where round equals to (roundId + 1)
        defaultRoundCustomerShouldNotBeFound("roundId.equals=" + (roundId + 1));
    }

    @Test
    @Transactional
    void getAllRoundCustomersByCustomerIsEqualToSomething() throws Exception {
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            roundCustomerRepository.saveAndFlush(roundCustomer);
            customer = CustomerResourceIT.createEntity(em);
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        em.persist(customer);
        em.flush();
        roundCustomer.setCustomer(customer);
        roundCustomerRepository.saveAndFlush(roundCustomer);
        Long customerId = customer.getId();
        // Get all the roundCustomerList where customer equals to customerId
        defaultRoundCustomerShouldBeFound("customerId.equals=" + customerId);

        // Get all the roundCustomerList where customer equals to (customerId + 1)
        defaultRoundCustomerShouldNotBeFound("customerId.equals=" + (customerId + 1));
    }

    private void defaultRoundCustomerFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultRoundCustomerShouldBeFound(shouldBeFound);
        defaultRoundCustomerShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultRoundCustomerShouldBeFound(String filter) throws Exception {
        restRoundCustomerMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(roundCustomer.getId().intValue())))
            .andExpect(jsonPath("$.[*].sequenceOrder").value(hasItem(DEFAULT_SEQUENCE_ORDER)))
            .andExpect(jsonPath("$.[*].visited").value(hasItem(DEFAULT_VISITED)))
            .andExpect(jsonPath("$.[*].visitTime").value(hasItem(DEFAULT_VISIT_TIME.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restRoundCustomerMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultRoundCustomerShouldNotBeFound(String filter) throws Exception {
        restRoundCustomerMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restRoundCustomerMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingRoundCustomer() throws Exception {
        // Get the roundCustomer
        restRoundCustomerMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRoundCustomer() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the roundCustomer
        RoundCustomer updatedRoundCustomer = roundCustomerRepository.findById(roundCustomer.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRoundCustomer are not directly saved in db
        em.detach(updatedRoundCustomer);
        updatedRoundCustomer
            .sequenceOrder(UPDATED_SEQUENCE_ORDER)
            .visited(UPDATED_VISITED)
            .visitTime(UPDATED_VISIT_TIME)
            .notes(UPDATED_NOTES);
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(updatedRoundCustomer);

        restRoundCustomerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, roundCustomerDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roundCustomerDTO))
            )
            .andExpect(status().isOk());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRoundCustomerToMatchAllProperties(updatedRoundCustomer);
    }

    @Test
    @Transactional
    void putNonExistingRoundCustomer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roundCustomer.setId(longCount.incrementAndGet());

        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRoundCustomerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, roundCustomerDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roundCustomerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRoundCustomer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roundCustomer.setId(longCount.incrementAndGet());

        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundCustomerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roundCustomerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRoundCustomer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roundCustomer.setId(longCount.incrementAndGet());

        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundCustomerMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roundCustomerDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRoundCustomerWithPatch() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the roundCustomer using partial update
        RoundCustomer partialUpdatedRoundCustomer = new RoundCustomer();
        partialUpdatedRoundCustomer.setId(roundCustomer.getId());

        restRoundCustomerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRoundCustomer.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRoundCustomer))
            )
            .andExpect(status().isOk());

        // Validate the RoundCustomer in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRoundCustomerUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedRoundCustomer, roundCustomer),
            getPersistedRoundCustomer(roundCustomer)
        );
    }

    @Test
    @Transactional
    void fullUpdateRoundCustomerWithPatch() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the roundCustomer using partial update
        RoundCustomer partialUpdatedRoundCustomer = new RoundCustomer();
        partialUpdatedRoundCustomer.setId(roundCustomer.getId());

        partialUpdatedRoundCustomer
            .sequenceOrder(UPDATED_SEQUENCE_ORDER)
            .visited(UPDATED_VISITED)
            .visitTime(UPDATED_VISIT_TIME)
            .notes(UPDATED_NOTES);

        restRoundCustomerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRoundCustomer.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRoundCustomer))
            )
            .andExpect(status().isOk());

        // Validate the RoundCustomer in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRoundCustomerUpdatableFieldsEquals(partialUpdatedRoundCustomer, getPersistedRoundCustomer(partialUpdatedRoundCustomer));
    }

    @Test
    @Transactional
    void patchNonExistingRoundCustomer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roundCustomer.setId(longCount.incrementAndGet());

        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRoundCustomerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, roundCustomerDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(roundCustomerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRoundCustomer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roundCustomer.setId(longCount.incrementAndGet());

        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundCustomerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(roundCustomerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRoundCustomer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roundCustomer.setId(longCount.incrementAndGet());

        // Create the RoundCustomer
        RoundCustomerDTO roundCustomerDTO = roundCustomerMapper.toDto(roundCustomer);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoundCustomerMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(roundCustomerDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RoundCustomer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRoundCustomer() throws Exception {
        // Initialize the database
        insertedRoundCustomer = roundCustomerRepository.saveAndFlush(roundCustomer);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the roundCustomer
        restRoundCustomerMockMvc
            .perform(delete(ENTITY_API_URL_ID, roundCustomer.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return roundCustomerRepository.count();
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

    protected RoundCustomer getPersistedRoundCustomer(RoundCustomer roundCustomer) {
        return roundCustomerRepository.findById(roundCustomer.getId()).orElseThrow();
    }

    protected void assertPersistedRoundCustomerToMatchAllProperties(RoundCustomer expectedRoundCustomer) {
        assertRoundCustomerAllPropertiesEquals(expectedRoundCustomer, getPersistedRoundCustomer(expectedRoundCustomer));
    }

    protected void assertPersistedRoundCustomerToMatchUpdatableProperties(RoundCustomer expectedRoundCustomer) {
        assertRoundCustomerAllUpdatablePropertiesEquals(expectedRoundCustomer, getPersistedRoundCustomer(expectedRoundCustomer));
    }
}
