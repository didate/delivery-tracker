package com.delivery.web.rest;

import static com.delivery.domain.PriceHistoryAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static com.delivery.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.PriceHistory;
import com.delivery.domain.Product;
import com.delivery.repository.PriceHistoryRepository;
import com.delivery.service.dto.PriceHistoryDTO;
import com.delivery.service.mapper.PriceHistoryMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
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
 * Integration tests for the {@link PriceHistoryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PriceHistoryResourceIT {

    private static final BigDecimal DEFAULT_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_PRICE = new BigDecimal(2);
    private static final BigDecimal SMALLER_PRICE = new BigDecimal(1 - 1);

    private static final LocalDate DEFAULT_EFFECTIVE_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_EFFECTIVE_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_EFFECTIVE_DATE = LocalDate.ofEpochDay(-1L);

    private static final String ENTITY_API_URL = "/api/price-histories";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private PriceHistoryMapper priceHistoryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPriceHistoryMockMvc;

    private PriceHistory priceHistory;

    private PriceHistory insertedPriceHistory;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PriceHistory createEntity(EntityManager em) {
        PriceHistory priceHistory = new PriceHistory().price(DEFAULT_PRICE).effectiveDate(DEFAULT_EFFECTIVE_DATE);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        priceHistory.setProduct(product);
        return priceHistory;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PriceHistory createUpdatedEntity(EntityManager em) {
        PriceHistory updatedPriceHistory = new PriceHistory().price(UPDATED_PRICE).effectiveDate(UPDATED_EFFECTIVE_DATE);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createUpdatedEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        updatedPriceHistory.setProduct(product);
        return updatedPriceHistory;
    }

    @BeforeEach
    void initTest() {
        priceHistory = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedPriceHistory != null) {
            priceHistoryRepository.delete(insertedPriceHistory);
            insertedPriceHistory = null;
        }
    }

    @Test
    @Transactional
    void createPriceHistory() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);
        var returnedPriceHistoryDTO = om.readValue(
            restPriceHistoryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(priceHistoryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PriceHistoryDTO.class
        );

        // Validate the PriceHistory in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPriceHistory = priceHistoryMapper.toEntity(returnedPriceHistoryDTO);
        assertPriceHistoryUpdatableFieldsEquals(returnedPriceHistory, getPersistedPriceHistory(returnedPriceHistory));

        insertedPriceHistory = returnedPriceHistory;
    }

    @Test
    @Transactional
    void createPriceHistoryWithExistingId() throws Exception {
        // Create the PriceHistory with an existing ID
        priceHistory.setId(1L);
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPriceHistoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(priceHistoryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        priceHistory.setPrice(null);

        // Create the PriceHistory, which fails.
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        restPriceHistoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(priceHistoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEffectiveDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        priceHistory.setEffectiveDate(null);

        // Create the PriceHistory, which fails.
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        restPriceHistoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(priceHistoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPriceHistories() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList
        restPriceHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(priceHistory.getId().intValue())))
            .andExpect(jsonPath("$.[*].price").value(hasItem(sameNumber(DEFAULT_PRICE))))
            .andExpect(jsonPath("$.[*].effectiveDate").value(hasItem(DEFAULT_EFFECTIVE_DATE.toString())));
    }

    @Test
    @Transactional
    void getPriceHistory() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get the priceHistory
        restPriceHistoryMockMvc
            .perform(get(ENTITY_API_URL_ID, priceHistory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(priceHistory.getId().intValue()))
            .andExpect(jsonPath("$.price").value(sameNumber(DEFAULT_PRICE)))
            .andExpect(jsonPath("$.effectiveDate").value(DEFAULT_EFFECTIVE_DATE.toString()));
    }

    @Test
    @Transactional
    void getPriceHistoriesByIdFiltering() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        Long id = priceHistory.getId();

        defaultPriceHistoryFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultPriceHistoryFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultPriceHistoryFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price equals to
        defaultPriceHistoryFiltering("price.equals=" + DEFAULT_PRICE, "price.equals=" + UPDATED_PRICE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price in
        defaultPriceHistoryFiltering("price.in=" + DEFAULT_PRICE + "," + UPDATED_PRICE, "price.in=" + UPDATED_PRICE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price is not null
        defaultPriceHistoryFiltering("price.specified=true", "price.specified=false");
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price is greater than or equal to
        defaultPriceHistoryFiltering("price.greaterThanOrEqual=" + DEFAULT_PRICE, "price.greaterThanOrEqual=" + UPDATED_PRICE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price is less than or equal to
        defaultPriceHistoryFiltering("price.lessThanOrEqual=" + DEFAULT_PRICE, "price.lessThanOrEqual=" + SMALLER_PRICE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price is less than
        defaultPriceHistoryFiltering("price.lessThan=" + UPDATED_PRICE, "price.lessThan=" + DEFAULT_PRICE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByPriceIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where price is greater than
        defaultPriceHistoryFiltering("price.greaterThan=" + SMALLER_PRICE, "price.greaterThan=" + DEFAULT_PRICE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate equals to
        defaultPriceHistoryFiltering("effectiveDate.equals=" + DEFAULT_EFFECTIVE_DATE, "effectiveDate.equals=" + UPDATED_EFFECTIVE_DATE);
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate in
        defaultPriceHistoryFiltering(
            "effectiveDate.in=" + DEFAULT_EFFECTIVE_DATE + "," + UPDATED_EFFECTIVE_DATE,
            "effectiveDate.in=" + UPDATED_EFFECTIVE_DATE
        );
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate is not null
        defaultPriceHistoryFiltering("effectiveDate.specified=true", "effectiveDate.specified=false");
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate is greater than or equal to
        defaultPriceHistoryFiltering(
            "effectiveDate.greaterThanOrEqual=" + DEFAULT_EFFECTIVE_DATE,
            "effectiveDate.greaterThanOrEqual=" + UPDATED_EFFECTIVE_DATE
        );
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate is less than or equal to
        defaultPriceHistoryFiltering(
            "effectiveDate.lessThanOrEqual=" + DEFAULT_EFFECTIVE_DATE,
            "effectiveDate.lessThanOrEqual=" + SMALLER_EFFECTIVE_DATE
        );
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate is less than
        defaultPriceHistoryFiltering(
            "effectiveDate.lessThan=" + UPDATED_EFFECTIVE_DATE,
            "effectiveDate.lessThan=" + DEFAULT_EFFECTIVE_DATE
        );
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByEffectiveDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        // Get all the priceHistoryList where effectiveDate is greater than
        defaultPriceHistoryFiltering(
            "effectiveDate.greaterThan=" + SMALLER_EFFECTIVE_DATE,
            "effectiveDate.greaterThan=" + DEFAULT_EFFECTIVE_DATE
        );
    }

    @Test
    @Transactional
    void getAllPriceHistoriesByProductIsEqualToSomething() throws Exception {
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            priceHistoryRepository.saveAndFlush(priceHistory);
            product = ProductResourceIT.createEntity(em);
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        em.persist(product);
        em.flush();
        priceHistory.setProduct(product);
        priceHistoryRepository.saveAndFlush(priceHistory);
        Long productId = product.getId();
        // Get all the priceHistoryList where product equals to productId
        defaultPriceHistoryShouldBeFound("productId.equals=" + productId);

        // Get all the priceHistoryList where product equals to (productId + 1)
        defaultPriceHistoryShouldNotBeFound("productId.equals=" + (productId + 1));
    }

    private void defaultPriceHistoryFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultPriceHistoryShouldBeFound(shouldBeFound);
        defaultPriceHistoryShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultPriceHistoryShouldBeFound(String filter) throws Exception {
        restPriceHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(priceHistory.getId().intValue())))
            .andExpect(jsonPath("$.[*].price").value(hasItem(sameNumber(DEFAULT_PRICE))))
            .andExpect(jsonPath("$.[*].effectiveDate").value(hasItem(DEFAULT_EFFECTIVE_DATE.toString())));

        // Check, that the count call also returns 1
        restPriceHistoryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultPriceHistoryShouldNotBeFound(String filter) throws Exception {
        restPriceHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restPriceHistoryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingPriceHistory() throws Exception {
        // Get the priceHistory
        restPriceHistoryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPriceHistory() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the priceHistory
        PriceHistory updatedPriceHistory = priceHistoryRepository.findById(priceHistory.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPriceHistory are not directly saved in db
        em.detach(updatedPriceHistory);
        updatedPriceHistory.price(UPDATED_PRICE).effectiveDate(UPDATED_EFFECTIVE_DATE);
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(updatedPriceHistory);

        restPriceHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, priceHistoryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(priceHistoryDTO))
            )
            .andExpect(status().isOk());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPriceHistoryToMatchAllProperties(updatedPriceHistory);
    }

    @Test
    @Transactional
    void putNonExistingPriceHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        priceHistory.setId(longCount.incrementAndGet());

        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPriceHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, priceHistoryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(priceHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPriceHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        priceHistory.setId(longCount.incrementAndGet());

        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPriceHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(priceHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPriceHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        priceHistory.setId(longCount.incrementAndGet());

        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPriceHistoryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(priceHistoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePriceHistoryWithPatch() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the priceHistory using partial update
        PriceHistory partialUpdatedPriceHistory = new PriceHistory();
        partialUpdatedPriceHistory.setId(priceHistory.getId());

        partialUpdatedPriceHistory.price(UPDATED_PRICE).effectiveDate(UPDATED_EFFECTIVE_DATE);

        restPriceHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPriceHistory.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPriceHistory))
            )
            .andExpect(status().isOk());

        // Validate the PriceHistory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPriceHistoryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPriceHistory, priceHistory),
            getPersistedPriceHistory(priceHistory)
        );
    }

    @Test
    @Transactional
    void fullUpdatePriceHistoryWithPatch() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the priceHistory using partial update
        PriceHistory partialUpdatedPriceHistory = new PriceHistory();
        partialUpdatedPriceHistory.setId(priceHistory.getId());

        partialUpdatedPriceHistory.price(UPDATED_PRICE).effectiveDate(UPDATED_EFFECTIVE_DATE);

        restPriceHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPriceHistory.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPriceHistory))
            )
            .andExpect(status().isOk());

        // Validate the PriceHistory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPriceHistoryUpdatableFieldsEquals(partialUpdatedPriceHistory, getPersistedPriceHistory(partialUpdatedPriceHistory));
    }

    @Test
    @Transactional
    void patchNonExistingPriceHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        priceHistory.setId(longCount.incrementAndGet());

        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPriceHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, priceHistoryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(priceHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPriceHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        priceHistory.setId(longCount.incrementAndGet());

        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPriceHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(priceHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPriceHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        priceHistory.setId(longCount.incrementAndGet());

        // Create the PriceHistory
        PriceHistoryDTO priceHistoryDTO = priceHistoryMapper.toDto(priceHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPriceHistoryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(priceHistoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PriceHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePriceHistory() throws Exception {
        // Initialize the database
        insertedPriceHistory = priceHistoryRepository.saveAndFlush(priceHistory);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the priceHistory
        restPriceHistoryMockMvc
            .perform(delete(ENTITY_API_URL_ID, priceHistory.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return priceHistoryRepository.count();
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

    protected PriceHistory getPersistedPriceHistory(PriceHistory priceHistory) {
        return priceHistoryRepository.findById(priceHistory.getId()).orElseThrow();
    }

    protected void assertPersistedPriceHistoryToMatchAllProperties(PriceHistory expectedPriceHistory) {
        assertPriceHistoryAllPropertiesEquals(expectedPriceHistory, getPersistedPriceHistory(expectedPriceHistory));
    }

    protected void assertPersistedPriceHistoryToMatchUpdatableProperties(PriceHistory expectedPriceHistory) {
        assertPriceHistoryAllUpdatablePropertiesEquals(expectedPriceHistory, getPersistedPriceHistory(expectedPriceHistory));
    }
}
