package com.delivery.web.rest;

import static com.delivery.domain.ProductionAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static com.delivery.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Product;
import com.delivery.domain.Production;
import com.delivery.domain.ProductionSite;
import com.delivery.domain.Tenant;
import com.delivery.repository.ProductionRepository;
import com.delivery.service.dto.ProductionDTO;
import com.delivery.service.mapper.ProductionMapper;
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
 * Integration tests for the {@link ProductionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ProductionResourceIT {

    private static final LocalDate DEFAULT_PRODUCTION_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_PRODUCTION_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_PRODUCTION_DATE = LocalDate.ofEpochDay(-1L);

    private static final BigDecimal DEFAULT_QUANTITY = new BigDecimal(1);
    private static final BigDecimal UPDATED_QUANTITY = new BigDecimal(2);
    private static final BigDecimal SMALLER_QUANTITY = new BigDecimal(1 - 1);

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/productions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private ProductionMapper productionMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProductionMockMvc;

    private Production production;

    private Production insertedProduction;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Production createEntity(EntityManager em) {
        Production production = new Production().productionDate(DEFAULT_PRODUCTION_DATE).quantity(DEFAULT_QUANTITY).notes(DEFAULT_NOTES);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        production.setTenant(tenant);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        production.setProduct(product);
        // Add required entity
        ProductionSite productionSite;
        if (TestUtil.findAll(em, ProductionSite.class).isEmpty()) {
            productionSite = ProductionSiteResourceIT.createEntity(em);
            em.persist(productionSite);
            em.flush();
        } else {
            productionSite = TestUtil.findAll(em, ProductionSite.class).get(0);
        }
        production.setProductionSite(productionSite);
        return production;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Production createUpdatedEntity(EntityManager em) {
        Production updatedProduction = new Production()
            .productionDate(UPDATED_PRODUCTION_DATE)
            .quantity(UPDATED_QUANTITY)
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
        updatedProduction.setTenant(tenant);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createUpdatedEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        updatedProduction.setProduct(product);
        // Add required entity
        ProductionSite productionSite;
        if (TestUtil.findAll(em, ProductionSite.class).isEmpty()) {
            productionSite = ProductionSiteResourceIT.createUpdatedEntity(em);
            em.persist(productionSite);
            em.flush();
        } else {
            productionSite = TestUtil.findAll(em, ProductionSite.class).get(0);
        }
        updatedProduction.setProductionSite(productionSite);
        return updatedProduction;
    }

    @BeforeEach
    void initTest() {
        production = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedProduction != null) {
            productionRepository.delete(insertedProduction);
            insertedProduction = null;
        }
    }

    @Test
    @Transactional
    void createProduction() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);
        var returnedProductionDTO = om.readValue(
            restProductionMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productionDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ProductionDTO.class
        );

        // Validate the Production in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedProduction = productionMapper.toEntity(returnedProductionDTO);
        assertProductionUpdatableFieldsEquals(returnedProduction, getPersistedProduction(returnedProduction));

        insertedProduction = returnedProduction;
    }

    @Test
    @Transactional
    void createProductionWithExistingId() throws Exception {
        // Create the Production with an existing ID
        production.setId(1L);
        ProductionDTO productionDTO = productionMapper.toDto(production);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProductionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productionDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkProductionDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        production.setProductionDate(null);

        // Create the Production, which fails.
        ProductionDTO productionDTO = productionMapper.toDto(production);

        restProductionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkQuantityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        production.setQuantity(null);

        // Create the Production, which fails.
        ProductionDTO productionDTO = productionMapper.toDto(production);

        restProductionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllProductions() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList
        restProductionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(production.getId().intValue())))
            .andExpect(jsonPath("$.[*].productionDate").value(hasItem(DEFAULT_PRODUCTION_DATE.toString())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(sameNumber(DEFAULT_QUANTITY))))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getProduction() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get the production
        restProductionMockMvc
            .perform(get(ENTITY_API_URL_ID, production.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(production.getId().intValue()))
            .andExpect(jsonPath("$.productionDate").value(DEFAULT_PRODUCTION_DATE.toString()))
            .andExpect(jsonPath("$.quantity").value(sameNumber(DEFAULT_QUANTITY)))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getProductionsByIdFiltering() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        Long id = production.getId();

        defaultProductionFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultProductionFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultProductionFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate equals to
        defaultProductionFiltering("productionDate.equals=" + DEFAULT_PRODUCTION_DATE, "productionDate.equals=" + UPDATED_PRODUCTION_DATE);
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate in
        defaultProductionFiltering(
            "productionDate.in=" + DEFAULT_PRODUCTION_DATE + "," + UPDATED_PRODUCTION_DATE,
            "productionDate.in=" + UPDATED_PRODUCTION_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate is not null
        defaultProductionFiltering("productionDate.specified=true", "productionDate.specified=false");
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate is greater than or equal to
        defaultProductionFiltering(
            "productionDate.greaterThanOrEqual=" + DEFAULT_PRODUCTION_DATE,
            "productionDate.greaterThanOrEqual=" + UPDATED_PRODUCTION_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate is less than or equal to
        defaultProductionFiltering(
            "productionDate.lessThanOrEqual=" + DEFAULT_PRODUCTION_DATE,
            "productionDate.lessThanOrEqual=" + SMALLER_PRODUCTION_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate is less than
        defaultProductionFiltering(
            "productionDate.lessThan=" + UPDATED_PRODUCTION_DATE,
            "productionDate.lessThan=" + DEFAULT_PRODUCTION_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductionsByProductionDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where productionDate is greater than
        defaultProductionFiltering(
            "productionDate.greaterThan=" + SMALLER_PRODUCTION_DATE,
            "productionDate.greaterThan=" + DEFAULT_PRODUCTION_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity equals to
        defaultProductionFiltering("quantity.equals=" + DEFAULT_QUANTITY, "quantity.equals=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsInShouldWork() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity in
        defaultProductionFiltering("quantity.in=" + DEFAULT_QUANTITY + "," + UPDATED_QUANTITY, "quantity.in=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity is not null
        defaultProductionFiltering("quantity.specified=true", "quantity.specified=false");
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity is greater than or equal to
        defaultProductionFiltering("quantity.greaterThanOrEqual=" + DEFAULT_QUANTITY, "quantity.greaterThanOrEqual=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity is less than or equal to
        defaultProductionFiltering("quantity.lessThanOrEqual=" + DEFAULT_QUANTITY, "quantity.lessThanOrEqual=" + SMALLER_QUANTITY);
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity is less than
        defaultProductionFiltering("quantity.lessThan=" + UPDATED_QUANTITY, "quantity.lessThan=" + DEFAULT_QUANTITY);
    }

    @Test
    @Transactional
    void getAllProductionsByQuantityIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        // Get all the productionList where quantity is greater than
        defaultProductionFiltering("quantity.greaterThan=" + SMALLER_QUANTITY, "quantity.greaterThan=" + DEFAULT_QUANTITY);
    }

    @Test
    @Transactional
    void getAllProductionsByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            productionRepository.saveAndFlush(production);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        production.setTenant(tenant);
        productionRepository.saveAndFlush(production);
        Long tenantId = tenant.getId();
        // Get all the productionList where tenant equals to tenantId
        defaultProductionShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the productionList where tenant equals to (tenantId + 1)
        defaultProductionShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    @Test
    @Transactional
    void getAllProductionsByProductIsEqualToSomething() throws Exception {
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            productionRepository.saveAndFlush(production);
            product = ProductResourceIT.createEntity(em);
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        em.persist(product);
        em.flush();
        production.setProduct(product);
        productionRepository.saveAndFlush(production);
        Long productId = product.getId();
        // Get all the productionList where product equals to productId
        defaultProductionShouldBeFound("productId.equals=" + productId);

        // Get all the productionList where product equals to (productId + 1)
        defaultProductionShouldNotBeFound("productId.equals=" + (productId + 1));
    }

    @Test
    @Transactional
    void getAllProductionsByProductionSiteIsEqualToSomething() throws Exception {
        ProductionSite productionSite;
        if (TestUtil.findAll(em, ProductionSite.class).isEmpty()) {
            productionRepository.saveAndFlush(production);
            productionSite = ProductionSiteResourceIT.createEntity(em);
        } else {
            productionSite = TestUtil.findAll(em, ProductionSite.class).get(0);
        }
        em.persist(productionSite);
        em.flush();
        production.setProductionSite(productionSite);
        productionRepository.saveAndFlush(production);
        Long productionSiteId = productionSite.getId();
        // Get all the productionList where productionSite equals to productionSiteId
        defaultProductionShouldBeFound("productionSiteId.equals=" + productionSiteId);

        // Get all the productionList where productionSite equals to (productionSiteId + 1)
        defaultProductionShouldNotBeFound("productionSiteId.equals=" + (productionSiteId + 1));
    }

    private void defaultProductionFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultProductionShouldBeFound(shouldBeFound);
        defaultProductionShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultProductionShouldBeFound(String filter) throws Exception {
        restProductionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(production.getId().intValue())))
            .andExpect(jsonPath("$.[*].productionDate").value(hasItem(DEFAULT_PRODUCTION_DATE.toString())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(sameNumber(DEFAULT_QUANTITY))))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restProductionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultProductionShouldNotBeFound(String filter) throws Exception {
        restProductionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restProductionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingProduction() throws Exception {
        // Get the production
        restProductionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProduction() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the production
        Production updatedProduction = productionRepository.findById(production.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedProduction are not directly saved in db
        em.detach(updatedProduction);
        updatedProduction.productionDate(UPDATED_PRODUCTION_DATE).quantity(UPDATED_QUANTITY).notes(UPDATED_NOTES);
        ProductionDTO productionDTO = productionMapper.toDto(updatedProduction);

        restProductionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, productionDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(productionDTO))
            )
            .andExpect(status().isOk());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProductionToMatchAllProperties(updatedProduction);
    }

    @Test
    @Transactional
    void putNonExistingProduction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        production.setId(longCount.incrementAndGet());

        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProductionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, productionDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(productionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProduction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        production.setId(longCount.incrementAndGet());

        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(productionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProduction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        production.setId(longCount.incrementAndGet());

        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductionMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProductionWithPatch() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the production using partial update
        Production partialUpdatedProduction = new Production();
        partialUpdatedProduction.setId(production.getId());

        partialUpdatedProduction.notes(UPDATED_NOTES);

        restProductionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProduction.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProduction))
            )
            .andExpect(status().isOk());

        // Validate the Production in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProductionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedProduction, production),
            getPersistedProduction(production)
        );
    }

    @Test
    @Transactional
    void fullUpdateProductionWithPatch() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the production using partial update
        Production partialUpdatedProduction = new Production();
        partialUpdatedProduction.setId(production.getId());

        partialUpdatedProduction.productionDate(UPDATED_PRODUCTION_DATE).quantity(UPDATED_QUANTITY).notes(UPDATED_NOTES);

        restProductionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProduction.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProduction))
            )
            .andExpect(status().isOk());

        // Validate the Production in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProductionUpdatableFieldsEquals(partialUpdatedProduction, getPersistedProduction(partialUpdatedProduction));
    }

    @Test
    @Transactional
    void patchNonExistingProduction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        production.setId(longCount.incrementAndGet());

        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProductionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, productionDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(productionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProduction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        production.setId(longCount.incrementAndGet());

        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(productionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProduction() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        production.setId(longCount.incrementAndGet());

        // Create the Production
        ProductionDTO productionDTO = productionMapper.toDto(production);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductionMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(productionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Production in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProduction() throws Exception {
        // Initialize the database
        insertedProduction = productionRepository.saveAndFlush(production);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the production
        restProductionMockMvc
            .perform(delete(ENTITY_API_URL_ID, production.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return productionRepository.count();
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

    protected Production getPersistedProduction(Production production) {
        return productionRepository.findById(production.getId()).orElseThrow();
    }

    protected void assertPersistedProductionToMatchAllProperties(Production expectedProduction) {
        assertProductionAllPropertiesEquals(expectedProduction, getPersistedProduction(expectedProduction));
    }

    protected void assertPersistedProductionToMatchUpdatableProperties(Production expectedProduction) {
        assertProductionAllUpdatablePropertiesEquals(expectedProduction, getPersistedProduction(expectedProduction));
    }
}
