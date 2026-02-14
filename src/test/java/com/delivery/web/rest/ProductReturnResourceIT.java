package com.delivery.web.rest;

import static com.delivery.domain.ProductReturnAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Customer;
import com.delivery.domain.Delivery;
import com.delivery.domain.ProductReturn;
import com.delivery.domain.Tenant;
import com.delivery.domain.enumeration.ReturnReason;
import com.delivery.repository.ProductReturnRepository;
import com.delivery.service.dto.ProductReturnDTO;
import com.delivery.service.mapper.ProductReturnMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
 * Integration tests for the {@link ProductReturnResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ProductReturnResourceIT {

    private static final LocalDate DEFAULT_RETURN_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_RETURN_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_RETURN_DATE = LocalDate.ofEpochDay(-1L);

    private static final ReturnReason DEFAULT_REASON = ReturnReason.DAMAGED;
    private static final ReturnReason UPDATED_REASON = ReturnReason.EXPIRED;

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/product-returns";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProductReturnRepository productReturnRepository;

    @Autowired
    private ProductReturnMapper productReturnMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProductReturnMockMvc;

    private ProductReturn productReturn;

    private ProductReturn insertedProductReturn;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProductReturn createEntity(EntityManager em) {
        ProductReturn productReturn = new ProductReturn().returnDate(DEFAULT_RETURN_DATE).reason(DEFAULT_REASON).notes(DEFAULT_NOTES);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        productReturn.setTenant(tenant);
        // Add required entity
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            customer = CustomerResourceIT.createEntity(em);
            em.persist(customer);
            em.flush();
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        productReturn.setCustomer(customer);
        return productReturn;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProductReturn createUpdatedEntity(EntityManager em) {
        ProductReturn updatedProductReturn = new ProductReturn()
            .returnDate(UPDATED_RETURN_DATE)
            .reason(UPDATED_REASON)
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
        updatedProductReturn.setTenant(tenant);
        // Add required entity
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            customer = CustomerResourceIT.createUpdatedEntity(em);
            em.persist(customer);
            em.flush();
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        updatedProductReturn.setCustomer(customer);
        return updatedProductReturn;
    }

    @BeforeEach
    void initTest() {
        productReturn = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedProductReturn != null) {
            productReturnRepository.delete(insertedProductReturn);
            insertedProductReturn = null;
        }
    }

    @Test
    @Transactional
    void createProductReturn() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);
        var returnedProductReturnDTO = om.readValue(
            restProductReturnMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productReturnDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ProductReturnDTO.class
        );

        // Validate the ProductReturn in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedProductReturn = productReturnMapper.toEntity(returnedProductReturnDTO);
        assertProductReturnUpdatableFieldsEquals(returnedProductReturn, getPersistedProductReturn(returnedProductReturn));

        insertedProductReturn = returnedProductReturn;
    }

    @Test
    @Transactional
    void createProductReturnWithExistingId() throws Exception {
        // Create the ProductReturn with an existing ID
        productReturn.setId(1L);
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProductReturnMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productReturnDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkReturnDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        productReturn.setReturnDate(null);

        // Create the ProductReturn, which fails.
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        restProductReturnMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productReturnDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkReasonIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        productReturn.setReason(null);

        // Create the ProductReturn, which fails.
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        restProductReturnMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productReturnDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllProductReturns() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList
        restProductReturnMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(productReturn.getId().intValue())))
            .andExpect(jsonPath("$.[*].returnDate").value(hasItem(DEFAULT_RETURN_DATE.toString())))
            .andExpect(jsonPath("$.[*].reason").value(hasItem(DEFAULT_REASON.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getProductReturn() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get the productReturn
        restProductReturnMockMvc
            .perform(get(ENTITY_API_URL_ID, productReturn.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(productReturn.getId().intValue()))
            .andExpect(jsonPath("$.returnDate").value(DEFAULT_RETURN_DATE.toString()))
            .andExpect(jsonPath("$.reason").value(DEFAULT_REASON.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getProductReturnsByIdFiltering() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        Long id = productReturn.getId();

        defaultProductReturnFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultProductReturnFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultProductReturnFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate equals to
        defaultProductReturnFiltering("returnDate.equals=" + DEFAULT_RETURN_DATE, "returnDate.equals=" + UPDATED_RETURN_DATE);
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate in
        defaultProductReturnFiltering(
            "returnDate.in=" + DEFAULT_RETURN_DATE + "," + UPDATED_RETURN_DATE,
            "returnDate.in=" + UPDATED_RETURN_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate is not null
        defaultProductReturnFiltering("returnDate.specified=true", "returnDate.specified=false");
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate is greater than or equal to
        defaultProductReturnFiltering(
            "returnDate.greaterThanOrEqual=" + DEFAULT_RETURN_DATE,
            "returnDate.greaterThanOrEqual=" + UPDATED_RETURN_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate is less than or equal to
        defaultProductReturnFiltering(
            "returnDate.lessThanOrEqual=" + DEFAULT_RETURN_DATE,
            "returnDate.lessThanOrEqual=" + SMALLER_RETURN_DATE
        );
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate is less than
        defaultProductReturnFiltering("returnDate.lessThan=" + UPDATED_RETURN_DATE, "returnDate.lessThan=" + DEFAULT_RETURN_DATE);
    }

    @Test
    @Transactional
    void getAllProductReturnsByReturnDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where returnDate is greater than
        defaultProductReturnFiltering("returnDate.greaterThan=" + SMALLER_RETURN_DATE, "returnDate.greaterThan=" + DEFAULT_RETURN_DATE);
    }

    @Test
    @Transactional
    void getAllProductReturnsByReasonIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where reason equals to
        defaultProductReturnFiltering("reason.equals=" + DEFAULT_REASON, "reason.equals=" + UPDATED_REASON);
    }

    @Test
    @Transactional
    void getAllProductReturnsByReasonIsInShouldWork() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where reason in
        defaultProductReturnFiltering("reason.in=" + DEFAULT_REASON + "," + UPDATED_REASON, "reason.in=" + UPDATED_REASON);
    }

    @Test
    @Transactional
    void getAllProductReturnsByReasonIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        // Get all the productReturnList where reason is not null
        defaultProductReturnFiltering("reason.specified=true", "reason.specified=false");
    }

    @Test
    @Transactional
    void getAllProductReturnsByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            productReturnRepository.saveAndFlush(productReturn);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        productReturn.setTenant(tenant);
        productReturnRepository.saveAndFlush(productReturn);
        Long tenantId = tenant.getId();
        // Get all the productReturnList where tenant equals to tenantId
        defaultProductReturnShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the productReturnList where tenant equals to (tenantId + 1)
        defaultProductReturnShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    @Test
    @Transactional
    void getAllProductReturnsByCustomerIsEqualToSomething() throws Exception {
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            productReturnRepository.saveAndFlush(productReturn);
            customer = CustomerResourceIT.createEntity(em);
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        em.persist(customer);
        em.flush();
        productReturn.setCustomer(customer);
        productReturnRepository.saveAndFlush(productReturn);
        Long customerId = customer.getId();
        // Get all the productReturnList where customer equals to customerId
        defaultProductReturnShouldBeFound("customerId.equals=" + customerId);

        // Get all the productReturnList where customer equals to (customerId + 1)
        defaultProductReturnShouldNotBeFound("customerId.equals=" + (customerId + 1));
    }

    @Test
    @Transactional
    void getAllProductReturnsByDeliveryIsEqualToSomething() throws Exception {
        Delivery delivery;
        if (TestUtil.findAll(em, Delivery.class).isEmpty()) {
            productReturnRepository.saveAndFlush(productReturn);
            delivery = DeliveryResourceIT.createEntity(em);
        } else {
            delivery = TestUtil.findAll(em, Delivery.class).get(0);
        }
        em.persist(delivery);
        em.flush();
        productReturn.setDelivery(delivery);
        productReturnRepository.saveAndFlush(productReturn);
        Long deliveryId = delivery.getId();
        // Get all the productReturnList where delivery equals to deliveryId
        defaultProductReturnShouldBeFound("deliveryId.equals=" + deliveryId);

        // Get all the productReturnList where delivery equals to (deliveryId + 1)
        defaultProductReturnShouldNotBeFound("deliveryId.equals=" + (deliveryId + 1));
    }

    private void defaultProductReturnFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultProductReturnShouldBeFound(shouldBeFound);
        defaultProductReturnShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultProductReturnShouldBeFound(String filter) throws Exception {
        restProductReturnMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(productReturn.getId().intValue())))
            .andExpect(jsonPath("$.[*].returnDate").value(hasItem(DEFAULT_RETURN_DATE.toString())))
            .andExpect(jsonPath("$.[*].reason").value(hasItem(DEFAULT_REASON.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restProductReturnMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultProductReturnShouldNotBeFound(String filter) throws Exception {
        restProductReturnMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restProductReturnMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingProductReturn() throws Exception {
        // Get the productReturn
        restProductReturnMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProductReturn() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the productReturn
        ProductReturn updatedProductReturn = productReturnRepository.findById(productReturn.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedProductReturn are not directly saved in db
        em.detach(updatedProductReturn);
        updatedProductReturn.returnDate(UPDATED_RETURN_DATE).reason(UPDATED_REASON).notes(UPDATED_NOTES);
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(updatedProductReturn);

        restProductReturnMockMvc
            .perform(
                put(ENTITY_API_URL_ID, productReturnDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(productReturnDTO))
            )
            .andExpect(status().isOk());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProductReturnToMatchAllProperties(updatedProductReturn);
    }

    @Test
    @Transactional
    void putNonExistingProductReturn() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        productReturn.setId(longCount.incrementAndGet());

        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProductReturnMockMvc
            .perform(
                put(ENTITY_API_URL_ID, productReturnDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(productReturnDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProductReturn() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        productReturn.setId(longCount.incrementAndGet());

        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductReturnMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(productReturnDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProductReturn() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        productReturn.setId(longCount.incrementAndGet());

        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductReturnMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(productReturnDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProductReturnWithPatch() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the productReturn using partial update
        ProductReturn partialUpdatedProductReturn = new ProductReturn();
        partialUpdatedProductReturn.setId(productReturn.getId());

        partialUpdatedProductReturn.reason(UPDATED_REASON).notes(UPDATED_NOTES);

        restProductReturnMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProductReturn.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProductReturn))
            )
            .andExpect(status().isOk());

        // Validate the ProductReturn in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProductReturnUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedProductReturn, productReturn),
            getPersistedProductReturn(productReturn)
        );
    }

    @Test
    @Transactional
    void fullUpdateProductReturnWithPatch() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the productReturn using partial update
        ProductReturn partialUpdatedProductReturn = new ProductReturn();
        partialUpdatedProductReturn.setId(productReturn.getId());

        partialUpdatedProductReturn.returnDate(UPDATED_RETURN_DATE).reason(UPDATED_REASON).notes(UPDATED_NOTES);

        restProductReturnMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProductReturn.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProductReturn))
            )
            .andExpect(status().isOk());

        // Validate the ProductReturn in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProductReturnUpdatableFieldsEquals(partialUpdatedProductReturn, getPersistedProductReturn(partialUpdatedProductReturn));
    }

    @Test
    @Transactional
    void patchNonExistingProductReturn() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        productReturn.setId(longCount.incrementAndGet());

        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProductReturnMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, productReturnDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(productReturnDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProductReturn() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        productReturn.setId(longCount.incrementAndGet());

        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductReturnMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(productReturnDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProductReturn() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        productReturn.setId(longCount.incrementAndGet());

        // Create the ProductReturn
        ProductReturnDTO productReturnDTO = productReturnMapper.toDto(productReturn);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProductReturnMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(productReturnDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ProductReturn in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProductReturn() throws Exception {
        // Initialize the database
        insertedProductReturn = productReturnRepository.saveAndFlush(productReturn);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the productReturn
        restProductReturnMockMvc
            .perform(delete(ENTITY_API_URL_ID, productReturn.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return productReturnRepository.count();
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

    protected ProductReturn getPersistedProductReturn(ProductReturn productReturn) {
        return productReturnRepository.findById(productReturn.getId()).orElseThrow();
    }

    protected void assertPersistedProductReturnToMatchAllProperties(ProductReturn expectedProductReturn) {
        assertProductReturnAllPropertiesEquals(expectedProductReturn, getPersistedProductReturn(expectedProductReturn));
    }

    protected void assertPersistedProductReturnToMatchUpdatableProperties(ProductReturn expectedProductReturn) {
        assertProductReturnAllUpdatablePropertiesEquals(expectedProductReturn, getPersistedProductReturn(expectedProductReturn));
    }
}
