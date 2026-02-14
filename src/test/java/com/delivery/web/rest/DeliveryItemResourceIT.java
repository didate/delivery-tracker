package com.delivery.web.rest;

import static com.delivery.domain.DeliveryItemAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static com.delivery.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Delivery;
import com.delivery.domain.DeliveryItem;
import com.delivery.domain.Product;
import com.delivery.repository.DeliveryItemRepository;
import com.delivery.service.dto.DeliveryItemDTO;
import com.delivery.service.mapper.DeliveryItemMapper;
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
 * Integration tests for the {@link DeliveryItemResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DeliveryItemResourceIT {

    private static final BigDecimal DEFAULT_QUANTITY = new BigDecimal(1);
    private static final BigDecimal UPDATED_QUANTITY = new BigDecimal(2);
    private static final BigDecimal SMALLER_QUANTITY = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_UNIT_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_UNIT_PRICE = new BigDecimal(2);
    private static final BigDecimal SMALLER_UNIT_PRICE = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TOTAL_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_PRICE = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL_PRICE = new BigDecimal(1 - 1);

    private static final String ENTITY_API_URL = "/api/delivery-items";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DeliveryItemRepository deliveryItemRepository;

    @Autowired
    private DeliveryItemMapper deliveryItemMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDeliveryItemMockMvc;

    private DeliveryItem deliveryItem;

    private DeliveryItem insertedDeliveryItem;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DeliveryItem createEntity(EntityManager em) {
        DeliveryItem deliveryItem = new DeliveryItem()
            .quantity(DEFAULT_QUANTITY)
            .unitPrice(DEFAULT_UNIT_PRICE)
            .totalPrice(DEFAULT_TOTAL_PRICE);
        // Add required entity
        Delivery delivery;
        if (TestUtil.findAll(em, Delivery.class).isEmpty()) {
            delivery = DeliveryResourceIT.createEntity(em);
            em.persist(delivery);
            em.flush();
        } else {
            delivery = TestUtil.findAll(em, Delivery.class).get(0);
        }
        deliveryItem.setDelivery(delivery);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        deliveryItem.setProduct(product);
        return deliveryItem;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DeliveryItem createUpdatedEntity(EntityManager em) {
        DeliveryItem updatedDeliveryItem = new DeliveryItem()
            .quantity(UPDATED_QUANTITY)
            .unitPrice(UPDATED_UNIT_PRICE)
            .totalPrice(UPDATED_TOTAL_PRICE);
        // Add required entity
        Delivery delivery;
        if (TestUtil.findAll(em, Delivery.class).isEmpty()) {
            delivery = DeliveryResourceIT.createUpdatedEntity(em);
            em.persist(delivery);
            em.flush();
        } else {
            delivery = TestUtil.findAll(em, Delivery.class).get(0);
        }
        updatedDeliveryItem.setDelivery(delivery);
        // Add required entity
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            product = ProductResourceIT.createUpdatedEntity(em);
            em.persist(product);
            em.flush();
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        updatedDeliveryItem.setProduct(product);
        return updatedDeliveryItem;
    }

    @BeforeEach
    void initTest() {
        deliveryItem = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedDeliveryItem != null) {
            deliveryItemRepository.delete(insertedDeliveryItem);
            insertedDeliveryItem = null;
        }
    }

    @Test
    @Transactional
    void createDeliveryItem() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);
        var returnedDeliveryItemDTO = om.readValue(
            restDeliveryItemMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryItemDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DeliveryItemDTO.class
        );

        // Validate the DeliveryItem in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDeliveryItem = deliveryItemMapper.toEntity(returnedDeliveryItemDTO);
        assertDeliveryItemUpdatableFieldsEquals(returnedDeliveryItem, getPersistedDeliveryItem(returnedDeliveryItem));

        insertedDeliveryItem = returnedDeliveryItem;
    }

    @Test
    @Transactional
    void createDeliveryItemWithExistingId() throws Exception {
        // Create the DeliveryItem with an existing ID
        deliveryItem.setId(1L);
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDeliveryItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryItemDTO)))
            .andExpect(status().isBadRequest());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkQuantityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        deliveryItem.setQuantity(null);

        // Create the DeliveryItem, which fails.
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        restDeliveryItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryItemDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUnitPriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        deliveryItem.setUnitPrice(null);

        // Create the DeliveryItem, which fails.
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        restDeliveryItemMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryItemDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDeliveryItems() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList
        restDeliveryItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(deliveryItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(sameNumber(DEFAULT_QUANTITY))))
            .andExpect(jsonPath("$.[*].unitPrice").value(hasItem(sameNumber(DEFAULT_UNIT_PRICE))))
            .andExpect(jsonPath("$.[*].totalPrice").value(hasItem(sameNumber(DEFAULT_TOTAL_PRICE))));
    }

    @Test
    @Transactional
    void getDeliveryItem() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get the deliveryItem
        restDeliveryItemMockMvc
            .perform(get(ENTITY_API_URL_ID, deliveryItem.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(deliveryItem.getId().intValue()))
            .andExpect(jsonPath("$.quantity").value(sameNumber(DEFAULT_QUANTITY)))
            .andExpect(jsonPath("$.unitPrice").value(sameNumber(DEFAULT_UNIT_PRICE)))
            .andExpect(jsonPath("$.totalPrice").value(sameNumber(DEFAULT_TOTAL_PRICE)));
    }

    @Test
    @Transactional
    void getDeliveryItemsByIdFiltering() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        Long id = deliveryItem.getId();

        defaultDeliveryItemFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultDeliveryItemFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultDeliveryItemFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity equals to
        defaultDeliveryItemFiltering("quantity.equals=" + DEFAULT_QUANTITY, "quantity.equals=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity in
        defaultDeliveryItemFiltering("quantity.in=" + DEFAULT_QUANTITY + "," + UPDATED_QUANTITY, "quantity.in=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity is not null
        defaultDeliveryItemFiltering("quantity.specified=true", "quantity.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity is greater than or equal to
        defaultDeliveryItemFiltering("quantity.greaterThanOrEqual=" + DEFAULT_QUANTITY, "quantity.greaterThanOrEqual=" + UPDATED_QUANTITY);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity is less than or equal to
        defaultDeliveryItemFiltering("quantity.lessThanOrEqual=" + DEFAULT_QUANTITY, "quantity.lessThanOrEqual=" + SMALLER_QUANTITY);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity is less than
        defaultDeliveryItemFiltering("quantity.lessThan=" + UPDATED_QUANTITY, "quantity.lessThan=" + DEFAULT_QUANTITY);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByQuantityIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where quantity is greater than
        defaultDeliveryItemFiltering("quantity.greaterThan=" + SMALLER_QUANTITY, "quantity.greaterThan=" + DEFAULT_QUANTITY);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice equals to
        defaultDeliveryItemFiltering("unitPrice.equals=" + DEFAULT_UNIT_PRICE, "unitPrice.equals=" + UPDATED_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice in
        defaultDeliveryItemFiltering("unitPrice.in=" + DEFAULT_UNIT_PRICE + "," + UPDATED_UNIT_PRICE, "unitPrice.in=" + UPDATED_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice is not null
        defaultDeliveryItemFiltering("unitPrice.specified=true", "unitPrice.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice is greater than or equal to
        defaultDeliveryItemFiltering(
            "unitPrice.greaterThanOrEqual=" + DEFAULT_UNIT_PRICE,
            "unitPrice.greaterThanOrEqual=" + UPDATED_UNIT_PRICE
        );
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice is less than or equal to
        defaultDeliveryItemFiltering("unitPrice.lessThanOrEqual=" + DEFAULT_UNIT_PRICE, "unitPrice.lessThanOrEqual=" + SMALLER_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice is less than
        defaultDeliveryItemFiltering("unitPrice.lessThan=" + UPDATED_UNIT_PRICE, "unitPrice.lessThan=" + DEFAULT_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByUnitPriceIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where unitPrice is greater than
        defaultDeliveryItemFiltering("unitPrice.greaterThan=" + SMALLER_UNIT_PRICE, "unitPrice.greaterThan=" + DEFAULT_UNIT_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice equals to
        defaultDeliveryItemFiltering("totalPrice.equals=" + DEFAULT_TOTAL_PRICE, "totalPrice.equals=" + UPDATED_TOTAL_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice in
        defaultDeliveryItemFiltering(
            "totalPrice.in=" + DEFAULT_TOTAL_PRICE + "," + UPDATED_TOTAL_PRICE,
            "totalPrice.in=" + UPDATED_TOTAL_PRICE
        );
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice is not null
        defaultDeliveryItemFiltering("totalPrice.specified=true", "totalPrice.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice is greater than or equal to
        defaultDeliveryItemFiltering(
            "totalPrice.greaterThanOrEqual=" + DEFAULT_TOTAL_PRICE,
            "totalPrice.greaterThanOrEqual=" + UPDATED_TOTAL_PRICE
        );
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice is less than or equal to
        defaultDeliveryItemFiltering(
            "totalPrice.lessThanOrEqual=" + DEFAULT_TOTAL_PRICE,
            "totalPrice.lessThanOrEqual=" + SMALLER_TOTAL_PRICE
        );
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice is less than
        defaultDeliveryItemFiltering("totalPrice.lessThan=" + UPDATED_TOTAL_PRICE, "totalPrice.lessThan=" + DEFAULT_TOTAL_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByTotalPriceIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        // Get all the deliveryItemList where totalPrice is greater than
        defaultDeliveryItemFiltering("totalPrice.greaterThan=" + SMALLER_TOTAL_PRICE, "totalPrice.greaterThan=" + DEFAULT_TOTAL_PRICE);
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByDeliveryIsEqualToSomething() throws Exception {
        Delivery delivery;
        if (TestUtil.findAll(em, Delivery.class).isEmpty()) {
            deliveryItemRepository.saveAndFlush(deliveryItem);
            delivery = DeliveryResourceIT.createEntity(em);
        } else {
            delivery = TestUtil.findAll(em, Delivery.class).get(0);
        }
        em.persist(delivery);
        em.flush();
        deliveryItem.setDelivery(delivery);
        deliveryItemRepository.saveAndFlush(deliveryItem);
        Long deliveryId = delivery.getId();
        // Get all the deliveryItemList where delivery equals to deliveryId
        defaultDeliveryItemShouldBeFound("deliveryId.equals=" + deliveryId);

        // Get all the deliveryItemList where delivery equals to (deliveryId + 1)
        defaultDeliveryItemShouldNotBeFound("deliveryId.equals=" + (deliveryId + 1));
    }

    @Test
    @Transactional
    void getAllDeliveryItemsByProductIsEqualToSomething() throws Exception {
        Product product;
        if (TestUtil.findAll(em, Product.class).isEmpty()) {
            deliveryItemRepository.saveAndFlush(deliveryItem);
            product = ProductResourceIT.createEntity(em);
        } else {
            product = TestUtil.findAll(em, Product.class).get(0);
        }
        em.persist(product);
        em.flush();
        deliveryItem.setProduct(product);
        deliveryItemRepository.saveAndFlush(deliveryItem);
        Long productId = product.getId();
        // Get all the deliveryItemList where product equals to productId
        defaultDeliveryItemShouldBeFound("productId.equals=" + productId);

        // Get all the deliveryItemList where product equals to (productId + 1)
        defaultDeliveryItemShouldNotBeFound("productId.equals=" + (productId + 1));
    }

    private void defaultDeliveryItemFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultDeliveryItemShouldBeFound(shouldBeFound);
        defaultDeliveryItemShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultDeliveryItemShouldBeFound(String filter) throws Exception {
        restDeliveryItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(deliveryItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(sameNumber(DEFAULT_QUANTITY))))
            .andExpect(jsonPath("$.[*].unitPrice").value(hasItem(sameNumber(DEFAULT_UNIT_PRICE))))
            .andExpect(jsonPath("$.[*].totalPrice").value(hasItem(sameNumber(DEFAULT_TOTAL_PRICE))));

        // Check, that the count call also returns 1
        restDeliveryItemMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultDeliveryItemShouldNotBeFound(String filter) throws Exception {
        restDeliveryItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restDeliveryItemMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingDeliveryItem() throws Exception {
        // Get the deliveryItem
        restDeliveryItemMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDeliveryItem() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the deliveryItem
        DeliveryItem updatedDeliveryItem = deliveryItemRepository.findById(deliveryItem.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDeliveryItem are not directly saved in db
        em.detach(updatedDeliveryItem);
        updatedDeliveryItem.quantity(UPDATED_QUANTITY).unitPrice(UPDATED_UNIT_PRICE).totalPrice(UPDATED_TOTAL_PRICE);
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(updatedDeliveryItem);

        restDeliveryItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deliveryItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deliveryItemDTO))
            )
            .andExpect(status().isOk());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDeliveryItemToMatchAllProperties(updatedDeliveryItem);
    }

    @Test
    @Transactional
    void putNonExistingDeliveryItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deliveryItem.setId(longCount.incrementAndGet());

        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeliveryItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deliveryItemDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deliveryItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDeliveryItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deliveryItem.setId(longCount.incrementAndGet());

        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deliveryItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDeliveryItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deliveryItem.setId(longCount.incrementAndGet());

        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryItemMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDeliveryItemWithPatch() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the deliveryItem using partial update
        DeliveryItem partialUpdatedDeliveryItem = new DeliveryItem();
        partialUpdatedDeliveryItem.setId(deliveryItem.getId());

        partialUpdatedDeliveryItem.unitPrice(UPDATED_UNIT_PRICE).totalPrice(UPDATED_TOTAL_PRICE);

        restDeliveryItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDeliveryItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDeliveryItem))
            )
            .andExpect(status().isOk());

        // Validate the DeliveryItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDeliveryItemUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDeliveryItem, deliveryItem),
            getPersistedDeliveryItem(deliveryItem)
        );
    }

    @Test
    @Transactional
    void fullUpdateDeliveryItemWithPatch() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the deliveryItem using partial update
        DeliveryItem partialUpdatedDeliveryItem = new DeliveryItem();
        partialUpdatedDeliveryItem.setId(deliveryItem.getId());

        partialUpdatedDeliveryItem.quantity(UPDATED_QUANTITY).unitPrice(UPDATED_UNIT_PRICE).totalPrice(UPDATED_TOTAL_PRICE);

        restDeliveryItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDeliveryItem.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDeliveryItem))
            )
            .andExpect(status().isOk());

        // Validate the DeliveryItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDeliveryItemUpdatableFieldsEquals(partialUpdatedDeliveryItem, getPersistedDeliveryItem(partialUpdatedDeliveryItem));
    }

    @Test
    @Transactional
    void patchNonExistingDeliveryItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deliveryItem.setId(longCount.incrementAndGet());

        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeliveryItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, deliveryItemDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deliveryItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDeliveryItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deliveryItem.setId(longCount.incrementAndGet());

        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deliveryItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDeliveryItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deliveryItem.setId(longCount.incrementAndGet());

        // Create the DeliveryItem
        DeliveryItemDTO deliveryItemDTO = deliveryItemMapper.toDto(deliveryItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryItemMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(deliveryItemDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DeliveryItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDeliveryItem() throws Exception {
        // Initialize the database
        insertedDeliveryItem = deliveryItemRepository.saveAndFlush(deliveryItem);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the deliveryItem
        restDeliveryItemMockMvc
            .perform(delete(ENTITY_API_URL_ID, deliveryItem.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return deliveryItemRepository.count();
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

    protected DeliveryItem getPersistedDeliveryItem(DeliveryItem deliveryItem) {
        return deliveryItemRepository.findById(deliveryItem.getId()).orElseThrow();
    }

    protected void assertPersistedDeliveryItemToMatchAllProperties(DeliveryItem expectedDeliveryItem) {
        assertDeliveryItemAllPropertiesEquals(expectedDeliveryItem, getPersistedDeliveryItem(expectedDeliveryItem));
    }

    protected void assertPersistedDeliveryItemToMatchUpdatableProperties(DeliveryItem expectedDeliveryItem) {
        assertDeliveryItemAllUpdatablePropertiesEquals(expectedDeliveryItem, getPersistedDeliveryItem(expectedDeliveryItem));
    }
}
