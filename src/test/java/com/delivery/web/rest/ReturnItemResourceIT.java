package com.delivery.web.rest;

import static com.delivery.domain.ReturnItemAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static com.delivery.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Product;
import com.delivery.domain.ProductReturn;
import com.delivery.domain.ReturnItem;
import com.delivery.repository.ReturnItemRepository;
import com.delivery.service.dto.ReturnItemDTO;
import com.delivery.service.mapper.ReturnItemMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link ReturnItemResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ReturnItemResourceIT {

    private static final BigDecimal DEFAULT_QUANTITY = new BigDecimal(1);
    private static final BigDecimal UPDATED_QUANTITY = new BigDecimal(2);
    private static final BigDecimal SMALLER_QUANTITY = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_UNIT_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_UNIT_PRICE = new BigDecimal(2);
    private static final BigDecimal SMALLER_UNIT_PRICE = new BigDecimal(1 - 1);

    private static final String ENTITY_API_URL = "/api/return-items";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ReturnItemRepository returnItemRepository;

    @Autowired
    private ReturnItemMapper returnItemMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restReturnItemMockMvc;

    private ReturnItem returnItem;

    private ReturnItem insertedReturnItem;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ReturnItem createEntity(EntityManager em) {
        ReturnItem returnItem = new ReturnItem().quantity(DEFAULT_QUANTITY).unitPrice(DEFAULT_UNIT_PRICE);
        // Add required entity
        ProductReturn productReturn;
        if (TestUtil.findAll(em, ProductReturn.class).isEmpty()) {
            productReturn = ProductReturnResourceIT.createEntity(em);
            em.persist(productReturn);
            em.flush();
        } else {
            productReturn = TestUtil.findAll(em, ProductReturn.class).get(0);
        }
        returnItem.setProductReturn(productReturn);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        returnItem.setProduct(product);
        return returnItem;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ReturnItem createUpdatedEntity(EntityManager em) {
        ReturnItem updatedReturnItem = new ReturnItem().quantity(UPDATED_QUANTITY).unitPrice(UPDATED_UNIT_PRICE);
        // Add required entity
        ProductReturn productReturn;
        if (TestUtil.findAll(em, ProductReturn.class).isEmpty()) {
            productReturn = ProductReturnResourceIT.createUpdatedEntity(em);
            em.persist(productReturn);
            em.flush();
        } else {
            productReturn = TestUtil.findAll(em, ProductReturn.class).get(0);
        }
        updatedReturnItem.setProductReturn(productReturn);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createUpdatedEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        updatedReturnItem.setProduct(product);
        return updatedReturnItem;
    }

    @BeforeEach
    void initTest() {
        returnItem = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedReturnItem != null) {
            returnItemRepository.delete(insertedReturnItem);
            insertedReturnItem = null;
        }
    }

    @Test
    @Transactional
    void createReturnItem() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);
        var returnedReturnItemDTO = om.readValue(
            restReturnItemMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(returnItemDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ReturnItemDTO.class
        );

        // Validate the ReturnItem in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedReturnItem = returnItemMapper.toEntity(returnedReturnItemDTO);
        assertReturnItemUpdatableFieldsEquals(returnedReturnItem, getPersistedReturnItem(returnedReturnItem));

        insertedReturnItem = returnedReturnItem;
    }

    @Test
    @Transactional
    void createReturnItemWithExistingId() throws Exception {
        // Create the ReturnItem with an existing ID
        returnItem.setId(1L);
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restReturnItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(returnItemDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkQuantityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        returnItem.setQuantity(null);

        // Create the ReturnItem, which fails.
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        restReturnItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(returnItemDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllReturnItems() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList
        restReturnItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(returnItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(sameNumber(DEFAULT_QUANTITY))))
            .andExpect(jsonPath("$.[*].unitPrice").value(hasItem(sameNumber(DEFAULT_UNIT_PRICE))));
    }

    @Test
    @Transactional
    void getReturnItem() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get the returnItem
        restReturnItemMockMvc
            .perform(get(ENTITY_API_URL_ID, returnItem.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(returnItem.getId().intValue()))
            .andExpect(jsonPath("$.quantity").value(sameNumber(DEFAULT_QUANTITY)))
            .andExpect(jsonPath("$.unitPrice").value(sameNumber(DEFAULT_UNIT_PRICE)));
    }

    @Test
    @Transactional
    void getReturnItemsByIdFiltering() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        Long id = returnItem.getId();

        defaultReturnItemFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultReturnItemFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultReturnItemFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity equals to
        defaultReturnItemFiltering("quantity.equals=" + DEFAULT_QUANTITY, "quantity.equals=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsInShouldWork() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity in
        defaultReturnItemFiltering("quantity.in=" + DEFAULT_QUANTITY + "," + UPDATED_QUANTITY, "quantity.in=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity is not null
        defaultReturnItemFiltering("quantity.specified=true", "quantity.specified=false");
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity is greater than or equal to
        defaultReturnItemFiltering("quantity.greaterThanOrEqual=" + DEFAULT_QUANTITY, "quantity.greaterThanOrEqual=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity is less than or equal to
        defaultReturnItemFiltering("quantity.lessThanOrEqual=" + DEFAULT_QUANTITY, "quantity.lessThanOrEqual=" + SMALLER_QUANTITY);
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity is less than
        defaultReturnItemFiltering("quantity.lessThan=" + UPDATED_QUANTITY, "quantity.lessThan=" + DEFAULT_QUANTITY);
    }

    @Test
    @Transactional
    void getAllReturnItemsByQuantityIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where quantity is greater than
        defaultReturnItemFiltering("quantity.greaterThan=" + SMALLER_QUANTITY, "quantity.greaterThan=" + DEFAULT_QUANTITY);
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice equals to
        defaultReturnItemFiltering("unitPrice.equals=" + DEFAULT_UNIT_PRICE, "unitPrice.equals=" + UPDATED_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice in
        defaultReturnItemFiltering("unitPrice.in=" + DEFAULT_UNIT_PRICE + "," + UPDATED_UNIT_PRICE, "unitPrice.in=" + UPDATED_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice is not null
        defaultReturnItemFiltering("unitPrice.specified=true", "unitPrice.specified=false");
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice is greater than or equal to
        defaultReturnItemFiltering(
            "unitPrice.greaterThanOrEqual=" + DEFAULT_UNIT_PRICE,
            "unitPrice.greaterThanOrEqual=" + UPDATED_UNIT_PRICE
        );
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice is less than or equal to
        defaultReturnItemFiltering("unitPrice.lessThanOrEqual=" + DEFAULT_UNIT_PRICE, "unitPrice.lessThanOrEqual=" + SMALLER_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice is less than
        defaultReturnItemFiltering("unitPrice.lessThan=" + UPDATED_UNIT_PRICE, "unitPrice.lessThan=" + DEFAULT_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllReturnItemsByUnitPriceIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        // Get all the returnItemList where unitPrice is greater than
        defaultReturnItemFiltering("unitPrice.greaterThan=" + SMALLER_UNIT_PRICE, "unitPrice.greaterThan=" + DEFAULT_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllReturnItemsByProductReturnIsEqualToSomething() throws Exception {
        ProductReturn productReturn;
        if (TestUtil.findAll(em, ProductReturn.class).isEmpty()) {
            returnItemRepository.saveAndFlush(returnItem);
            productReturn = ProductReturnResourceIT.createEntity(em);
        } else {
            productReturn = TestUtil.findAll(em, ProductReturn.class).get(0);
        }
        em.persist(productReturn);
        em.flush();
        returnItem.setProductReturn(productReturn);
        returnItemRepository.saveAndFlush(returnItem);
        Long productReturnId = productReturn.getId();
        // Get all the returnItemList where productReturn equals to productReturnId
        defaultReturnItemShouldBeFound("productReturnId.equals=" + productReturnId);

        // Get all the returnItemList where productReturn equals to (productReturnId + 1)
        defaultReturnItemShouldNotBeFound("productReturnId.equals=" + (productReturnId + 1));
    }

    @Test
    @Transactional
    void getAllReturnItemsByProductIsEqualToSomething() throws Exception {
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            returnItemRepository.saveAndFlush(returnItem);
            product = ProductResourceIT.createEntity(em);
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        em.persist(product);
        em.flush();
        returnItem.setProduct(product);
        returnItemRepository.saveAndFlush(returnItem);
        Long productId = product.getId();
        // Get all the returnItemList where product equals to productId
        defaultReturnItemShouldBeFound("productId.equals=" + productId);

        // Get all the returnItemList where product equals to (productId + 1)
        defaultReturnItemShouldNotBeFound("productId.equals=" + (productId + 1));
    }

    private void defaultReturnItemFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultReturnItemShouldBeFound(shouldBeFound);
        defaultReturnItemShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultReturnItemShouldBeFound(String filter) throws Exception {
        restReturnItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(returnItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(sameNumber(DEFAULT_QUANTITY))))
            .andExpect(jsonPath("$.[*].unitPrice").value(hasItem(sameNumber(DEFAULT_UNIT_PRICE))));

        // Check, that the count call also returns 1
        restReturnItemMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultReturnItemShouldNotBeFound(String filter) throws Exception {
        restReturnItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restReturnItemMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingReturnItem() throws Exception {
        // Get the returnItem
        restReturnItemMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingReturnItem() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the returnItem
        ReturnItem updatedReturnItem = returnItemRepository.findById(returnItem.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedReturnItem are not directly saved in db
        em.detach(updatedReturnItem);
        updatedReturnItem.quantity(UPDATED_QUANTITY).unitPrice(UPDATED_UNIT_PRICE);
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(updatedReturnItem);

        restReturnItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, returnItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(returnItemDTO))
            )
            .andExpect(status().isOk());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedReturnItemToMatchAllProperties(updatedReturnItem);
    }

    @Test
    @Transactional
    void putNonExistingReturnItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        returnItem.setId(longCount.incrementAndGet());

        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReturnItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, returnItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(returnItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchReturnItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        returnItem.setId(longCount.incrementAndGet());

        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReturnItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(returnItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamReturnItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        returnItem.setId(longCount.incrementAndGet());

        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReturnItemMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(returnItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateReturnItemWithPatch() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the returnItem using partial update
        ReturnItem partialUpdatedReturnItem = new ReturnItem();
        partialUpdatedReturnItem.setId(returnItem.getId());

        partialUpdatedReturnItem.quantity(UPDATED_QUANTITY);

        restReturnItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReturnItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReturnItem))
            )
            .andExpect(status().isOk());

        // Validate the ReturnItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReturnItemUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedReturnItem, returnItem),
            getPersistedReturnItem(returnItem)
        );
    }

    @Test
    @Transactional
    void fullUpdateReturnItemWithPatch() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the returnItem using partial update
        ReturnItem partialUpdatedReturnItem = new ReturnItem();
        partialUpdatedReturnItem.setId(returnItem.getId());

        partialUpdatedReturnItem.quantity(UPDATED_QUANTITY).unitPrice(UPDATED_UNIT_PRICE);

        restReturnItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReturnItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReturnItem))
            )
            .andExpect(status().isOk());

        // Validate the ReturnItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReturnItemUpdatableFieldsEquals(partialUpdatedReturnItem, getPersistedReturnItem(partialUpdatedReturnItem));
    }

    @Test
    @Transactional
    void patchNonExistingReturnItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        returnItem.setId(longCount.incrementAndGet());

        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReturnItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, returnItemDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(returnItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchReturnItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        returnItem.setId(longCount.incrementAndGet());

        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReturnItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(returnItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamReturnItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        returnItem.setId(longCount.incrementAndGet());

        // Create the ReturnItem
        ReturnItemDTO returnItemDTO = returnItemMapper.toDto(returnItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReturnItemMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(returnItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ReturnItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteReturnItem() throws Exception {
        // Initialize the database
        insertedReturnItem = returnItemRepository.saveAndFlush(returnItem);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the returnItem
        restReturnItemMockMvc
            .perform(delete(ENTITY_API_URL_ID, returnItem.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return returnItemRepository.count();
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

    protected ReturnItem getPersistedReturnItem(ReturnItem returnItem) {
        return returnItemRepository.findById(returnItem.getId()).orElseThrow();
    }

    protected void assertPersistedReturnItemToMatchAllProperties(ReturnItem expectedReturnItem) {
        assertReturnItemAllPropertiesEquals(expectedReturnItem, getPersistedReturnItem(expectedReturnItem));
    }

    protected void assertPersistedReturnItemToMatchUpdatableProperties(ReturnItem expectedReturnItem) {
        assertReturnItemAllUpdatablePropertiesEquals(expectedReturnItem, getPersistedReturnItem(expectedReturnItem));
    }
}
