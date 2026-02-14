package com.delivery.web.rest;

import static com.delivery.domain.DeliveryAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static com.delivery.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Customer;
import com.delivery.domain.Delivery;
import com.delivery.domain.Driver;
import com.delivery.domain.Tenant;
import com.delivery.domain.enumeration.DeliveryStatus;
import com.delivery.repository.DeliveryRepository;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.mapper.DeliveryMapper;
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
 * Integration tests for the {@link DeliveryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DeliveryResourceIT {

    private static final LocalDate DEFAULT_DELIVERY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DELIVERY_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_DELIVERY_DATE = LocalDate.ofEpochDay(-1L);

    private static final DeliveryStatus DEFAULT_STATUS = DeliveryStatus.PENDING;
    private static final DeliveryStatus UPDATED_STATUS = DeliveryStatus.IN_PROGRESS;

    private static final BigDecimal DEFAULT_TOTAL_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL_AMOUNT = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_PAID_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_PAID_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_PAID_AMOUNT = new BigDecimal(1 - 1);

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/deliveries";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private DeliveryMapper deliveryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDeliveryMockMvc;

    private Delivery delivery;

    private Delivery insertedDelivery;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Delivery createEntity(EntityManager em) {
        Delivery delivery = new Delivery()
            .deliveryDate(DEFAULT_DELIVERY_DATE)
            .status(DEFAULT_STATUS)
            .totalAmount(DEFAULT_TOTAL_AMOUNT)
            .paidAmount(DEFAULT_PAID_AMOUNT)
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
        delivery.setTenant(tenant);
        // Add required entity
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            customer = CustomerResourceIT.createEntity(em);
            em.persist(customer);
            em.flush();
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        delivery.setCustomer(customer);
        // Add required entity
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            driver = DriverResourceIT.createEntity(em);
            em.persist(driver);
            em.flush();
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        delivery.setDriver(driver);
        return delivery;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Delivery createUpdatedEntity(EntityManager em) {
        Delivery updatedDelivery = new Delivery()
            .deliveryDate(UPDATED_DELIVERY_DATE)
            .status(UPDATED_STATUS)
            .totalAmount(UPDATED_TOTAL_AMOUNT)
            .paidAmount(UPDATED_PAID_AMOUNT)
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
        updatedDelivery.setTenant(tenant);
        // Add required entity
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            customer = CustomerResourceIT.createUpdatedEntity(em);
            em.persist(customer);
            em.flush();
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        updatedDelivery.setCustomer(customer);
        // Add required entity
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            driver = DriverResourceIT.createUpdatedEntity(em);
            em.persist(driver);
            em.flush();
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        updatedDelivery.setDriver(driver);
        return updatedDelivery;
    }

    @BeforeEach
    void initTest() {
        delivery = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedDelivery != null) {
            deliveryRepository.delete(insertedDelivery);
            insertedDelivery = null;
        }
    }

    @Test
    @Transactional
    void createDelivery() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);
        var returnedDeliveryDTO = om.readValue(
            restDeliveryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DeliveryDTO.class
        );

        // Validate the Delivery in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDelivery = deliveryMapper.toEntity(returnedDeliveryDTO);
        assertDeliveryUpdatableFieldsEquals(returnedDelivery, getPersistedDelivery(returnedDelivery));

        insertedDelivery = returnedDelivery;
    }

    @Test
    @Transactional
    void createDeliveryWithExistingId() throws Exception {
        // Create the Delivery with an existing ID
        delivery.setId(1L);
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDeliveryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDeliveryDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        delivery.setDeliveryDate(null);

        // Create the Delivery, which fails.
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        restDeliveryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        delivery.setStatus(null);

        // Create the Delivery, which fails.
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        restDeliveryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDeliveries() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList
        restDeliveryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(delivery.getId().intValue())))
            .andExpect(jsonPath("$.[*].deliveryDate").value(hasItem(DEFAULT_DELIVERY_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].totalAmount").value(hasItem(sameNumber(DEFAULT_TOTAL_AMOUNT))))
            .andExpect(jsonPath("$.[*].paidAmount").value(hasItem(sameNumber(DEFAULT_PAID_AMOUNT))))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getDelivery() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get the delivery
        restDeliveryMockMvc
            .perform(get(ENTITY_API_URL_ID, delivery.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(delivery.getId().intValue()))
            .andExpect(jsonPath("$.deliveryDate").value(DEFAULT_DELIVERY_DATE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.totalAmount").value(sameNumber(DEFAULT_TOTAL_AMOUNT)))
            .andExpect(jsonPath("$.paidAmount").value(sameNumber(DEFAULT_PAID_AMOUNT)))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getDeliveriesByIdFiltering() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        Long id = delivery.getId();

        defaultDeliveryFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultDeliveryFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultDeliveryFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate equals to
        defaultDeliveryFiltering("deliveryDate.equals=" + DEFAULT_DELIVERY_DATE, "deliveryDate.equals=" + UPDATED_DELIVERY_DATE);
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate in
        defaultDeliveryFiltering(
            "deliveryDate.in=" + DEFAULT_DELIVERY_DATE + "," + UPDATED_DELIVERY_DATE,
            "deliveryDate.in=" + UPDATED_DELIVERY_DATE
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate is not null
        defaultDeliveryFiltering("deliveryDate.specified=true", "deliveryDate.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate is greater than or equal to
        defaultDeliveryFiltering(
            "deliveryDate.greaterThanOrEqual=" + DEFAULT_DELIVERY_DATE,
            "deliveryDate.greaterThanOrEqual=" + UPDATED_DELIVERY_DATE
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate is less than or equal to
        defaultDeliveryFiltering(
            "deliveryDate.lessThanOrEqual=" + DEFAULT_DELIVERY_DATE,
            "deliveryDate.lessThanOrEqual=" + SMALLER_DELIVERY_DATE
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate is less than
        defaultDeliveryFiltering("deliveryDate.lessThan=" + UPDATED_DELIVERY_DATE, "deliveryDate.lessThan=" + DEFAULT_DELIVERY_DATE);
    }

    @Test
    @Transactional
    void getAllDeliveriesByDeliveryDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where deliveryDate is greater than
        defaultDeliveryFiltering("deliveryDate.greaterThan=" + SMALLER_DELIVERY_DATE, "deliveryDate.greaterThan=" + DEFAULT_DELIVERY_DATE);
    }

    @Test
    @Transactional
    void getAllDeliveriesByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where status equals to
        defaultDeliveryFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllDeliveriesByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where status in
        defaultDeliveryFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllDeliveriesByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where status is not null
        defaultDeliveryFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount equals to
        defaultDeliveryFiltering("totalAmount.equals=" + DEFAULT_TOTAL_AMOUNT, "totalAmount.equals=" + UPDATED_TOTAL_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount in
        defaultDeliveryFiltering(
            "totalAmount.in=" + DEFAULT_TOTAL_AMOUNT + "," + UPDATED_TOTAL_AMOUNT,
            "totalAmount.in=" + UPDATED_TOTAL_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount is not null
        defaultDeliveryFiltering("totalAmount.specified=true", "totalAmount.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount is greater than or equal to
        defaultDeliveryFiltering(
            "totalAmount.greaterThanOrEqual=" + DEFAULT_TOTAL_AMOUNT,
            "totalAmount.greaterThanOrEqual=" + UPDATED_TOTAL_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount is less than or equal to
        defaultDeliveryFiltering(
            "totalAmount.lessThanOrEqual=" + DEFAULT_TOTAL_AMOUNT,
            "totalAmount.lessThanOrEqual=" + SMALLER_TOTAL_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount is less than
        defaultDeliveryFiltering("totalAmount.lessThan=" + UPDATED_TOTAL_AMOUNT, "totalAmount.lessThan=" + DEFAULT_TOTAL_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByTotalAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where totalAmount is greater than
        defaultDeliveryFiltering("totalAmount.greaterThan=" + SMALLER_TOTAL_AMOUNT, "totalAmount.greaterThan=" + DEFAULT_TOTAL_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount equals to
        defaultDeliveryFiltering("paidAmount.equals=" + DEFAULT_PAID_AMOUNT, "paidAmount.equals=" + UPDATED_PAID_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount in
        defaultDeliveryFiltering(
            "paidAmount.in=" + DEFAULT_PAID_AMOUNT + "," + UPDATED_PAID_AMOUNT,
            "paidAmount.in=" + UPDATED_PAID_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount is not null
        defaultDeliveryFiltering("paidAmount.specified=true", "paidAmount.specified=false");
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount is greater than or equal to
        defaultDeliveryFiltering(
            "paidAmount.greaterThanOrEqual=" + DEFAULT_PAID_AMOUNT,
            "paidAmount.greaterThanOrEqual=" + UPDATED_PAID_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount is less than or equal to
        defaultDeliveryFiltering("paidAmount.lessThanOrEqual=" + DEFAULT_PAID_AMOUNT, "paidAmount.lessThanOrEqual=" + SMALLER_PAID_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount is less than
        defaultDeliveryFiltering("paidAmount.lessThan=" + UPDATED_PAID_AMOUNT, "paidAmount.lessThan=" + DEFAULT_PAID_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByPaidAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        // Get all the deliveryList where paidAmount is greater than
        defaultDeliveryFiltering("paidAmount.greaterThan=" + SMALLER_PAID_AMOUNT, "paidAmount.greaterThan=" + DEFAULT_PAID_AMOUNT);
    }

    @Test
    @Transactional
    void getAllDeliveriesByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            deliveryRepository.saveAndFlush(delivery);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        delivery.setTenant(tenant);
        deliveryRepository.saveAndFlush(delivery);
        Long tenantId = tenant.getId();
        // Get all the deliveryList where tenant equals to tenantId
        defaultDeliveryShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the deliveryList where tenant equals to (tenantId + 1)
        defaultDeliveryShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    @Test
    @Transactional
    void getAllDeliveriesByCustomerIsEqualToSomething() throws Exception {
        Customer customer;
        if (TestUtil.findAll(em, Customer.class).isEmpty()) {
            deliveryRepository.saveAndFlush(delivery);
            customer = CustomerResourceIT.createEntity(em);
        } else {
            customer = TestUtil.findAll(em, Customer.class).get(0);
        }
        em.persist(customer);
        em.flush();
        delivery.setCustomer(customer);
        deliveryRepository.saveAndFlush(delivery);
        Long customerId = customer.getId();
        // Get all the deliveryList where customer equals to customerId
        defaultDeliveryShouldBeFound("customerId.equals=" + customerId);

        // Get all the deliveryList where customer equals to (customerId + 1)
        defaultDeliveryShouldNotBeFound("customerId.equals=" + (customerId + 1));
    }

    @Test
    @Transactional
    void getAllDeliveriesByDriverIsEqualToSomething() throws Exception {
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            deliveryRepository.saveAndFlush(delivery);
            driver = DriverResourceIT.createEntity(em);
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        em.persist(driver);
        em.flush();
        delivery.setDriver(driver);
        deliveryRepository.saveAndFlush(delivery);
        Long driverId = driver.getId();
        // Get all the deliveryList where driver equals to driverId
        defaultDeliveryShouldBeFound("driverId.equals=" + driverId);

        // Get all the deliveryList where driver equals to (driverId + 1)
        defaultDeliveryShouldNotBeFound("driverId.equals=" + (driverId + 1));
    }

    private void defaultDeliveryFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultDeliveryShouldBeFound(shouldBeFound);
        defaultDeliveryShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultDeliveryShouldBeFound(String filter) throws Exception {
        restDeliveryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(delivery.getId().intValue())))
            .andExpect(jsonPath("$.[*].deliveryDate").value(hasItem(DEFAULT_DELIVERY_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].totalAmount").value(hasItem(sameNumber(DEFAULT_TOTAL_AMOUNT))))
            .andExpect(jsonPath("$.[*].paidAmount").value(hasItem(sameNumber(DEFAULT_PAID_AMOUNT))))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restDeliveryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultDeliveryShouldNotBeFound(String filter) throws Exception {
        restDeliveryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restDeliveryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingDelivery() throws Exception {
        // Get the delivery
        restDeliveryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDelivery() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the delivery
        Delivery updatedDelivery = deliveryRepository.findById(delivery.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDelivery are not directly saved in db
        em.detach(updatedDelivery);
        updatedDelivery
            .deliveryDate(UPDATED_DELIVERY_DATE)
            .status(UPDATED_STATUS)
            .totalAmount(UPDATED_TOTAL_AMOUNT)
            .paidAmount(UPDATED_PAID_AMOUNT)
            .notes(UPDATED_NOTES);
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(updatedDelivery);

        restDeliveryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deliveryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deliveryDTO))
            )
            .andExpect(status().isOk());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDeliveryToMatchAllProperties(updatedDelivery);
    }

    @Test
    @Transactional
    void putNonExistingDelivery() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        delivery.setId(longCount.incrementAndGet());

        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeliveryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deliveryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deliveryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDelivery() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        delivery.setId(longCount.incrementAndGet());

        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deliveryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDelivery() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        delivery.setId(longCount.incrementAndGet());

        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deliveryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDeliveryWithPatch() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the delivery using partial update
        Delivery partialUpdatedDelivery = new Delivery();
        partialUpdatedDelivery.setId(delivery.getId());

        partialUpdatedDelivery.deliveryDate(UPDATED_DELIVERY_DATE);

        restDeliveryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDelivery.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDelivery))
            )
            .andExpect(status().isOk());

        // Validate the Delivery in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDeliveryUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedDelivery, delivery), getPersistedDelivery(delivery));
    }

    @Test
    @Transactional
    void fullUpdateDeliveryWithPatch() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the delivery using partial update
        Delivery partialUpdatedDelivery = new Delivery();
        partialUpdatedDelivery.setId(delivery.getId());

        partialUpdatedDelivery
            .deliveryDate(UPDATED_DELIVERY_DATE)
            .status(UPDATED_STATUS)
            .totalAmount(UPDATED_TOTAL_AMOUNT)
            .paidAmount(UPDATED_PAID_AMOUNT)
            .notes(UPDATED_NOTES);

        restDeliveryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDelivery.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDelivery))
            )
            .andExpect(status().isOk());

        // Validate the Delivery in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDeliveryUpdatableFieldsEquals(partialUpdatedDelivery, getPersistedDelivery(partialUpdatedDelivery));
    }

    @Test
    @Transactional
    void patchNonExistingDelivery() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        delivery.setId(longCount.incrementAndGet());

        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeliveryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, deliveryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deliveryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDelivery() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        delivery.setId(longCount.incrementAndGet());

        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deliveryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDelivery() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        delivery.setId(longCount.incrementAndGet());

        // Create the Delivery
        DeliveryDTO deliveryDTO = deliveryMapper.toDto(delivery);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeliveryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(deliveryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Delivery in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDelivery() throws Exception {
        // Initialize the database
        insertedDelivery = deliveryRepository.saveAndFlush(delivery);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the delivery
        restDeliveryMockMvc
            .perform(delete(ENTITY_API_URL_ID, delivery.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return deliveryRepository.count();
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

    protected Delivery getPersistedDelivery(Delivery delivery) {
        return deliveryRepository.findById(delivery.getId()).orElseThrow();
    }

    protected void assertPersistedDeliveryToMatchAllProperties(Delivery expectedDelivery) {
        assertDeliveryAllPropertiesEquals(expectedDelivery, getPersistedDelivery(expectedDelivery));
    }

    protected void assertPersistedDeliveryToMatchUpdatableProperties(Delivery expectedDelivery) {
        assertDeliveryAllUpdatablePropertiesEquals(expectedDelivery, getPersistedDelivery(expectedDelivery));
    }
}
