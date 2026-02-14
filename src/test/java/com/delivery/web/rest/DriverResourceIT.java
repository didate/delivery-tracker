package com.delivery.web.rest;

import static com.delivery.domain.DriverAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Driver;
import com.delivery.domain.Tenant;
import com.delivery.domain.Vehicle;
import com.delivery.repository.DriverRepository;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.mapper.DriverMapper;
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
 * Integration tests for the {@link DriverResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DriverResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE = "AAAAAAAAAA";
    private static final String UPDATED_PHONE = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_LICENSE_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_LICENSE_NUMBER = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/drivers";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverMapper driverMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDriverMockMvc;

    private Driver driver;

    private Driver insertedDriver;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Driver createEntity(EntityManager em) {
        Driver driver = new Driver()
            .code(DEFAULT_CODE)
            .name(DEFAULT_NAME)
            .phone(DEFAULT_PHONE)
            .email(DEFAULT_EMAIL)
            .licenseNumber(DEFAULT_LICENSE_NUMBER)
            .active(DEFAULT_ACTIVE);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        driver.setTenant(tenant);
        return driver;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Driver createUpdatedEntity(EntityManager em) {
        Driver updatedDriver = new Driver()
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .phone(UPDATED_PHONE)
            .email(UPDATED_EMAIL)
            .licenseNumber(UPDATED_LICENSE_NUMBER)
            .active(UPDATED_ACTIVE);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createUpdatedEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        updatedDriver.setTenant(tenant);
        return updatedDriver;
    }

    @BeforeEach
    void initTest() {
        driver = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedDriver != null) {
            driverRepository.delete(insertedDriver);
            insertedDriver = null;
        }
    }

    @Test
    @Transactional
    void createDriver() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);
        var returnedDriverDTO = om.readValue(
            restDriverMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DriverDTO.class
        );

        // Validate the Driver in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDriver = driverMapper.toEntity(returnedDriverDTO);
        assertDriverUpdatableFieldsEquals(returnedDriver, getPersistedDriver(returnedDriver));

        insertedDriver = returnedDriver;
    }

    @Test
    @Transactional
    void createDriverWithExistingId() throws Exception {
        // Create the Driver with an existing ID
        driver.setId(1L);
        DriverDTO driverDTO = driverMapper.toDto(driver);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDriverMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        driver.setCode(null);

        // Create the Driver, which fails.
        DriverDTO driverDTO = driverMapper.toDto(driver);

        restDriverMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        driver.setName(null);

        // Create the Driver, which fails.
        DriverDTO driverDTO = driverMapper.toDto(driver);

        restDriverMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        driver.setActive(null);

        // Create the Driver, which fails.
        DriverDTO driverDTO = driverMapper.toDto(driver);

        restDriverMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDrivers() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList
        restDriverMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(driver.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].licenseNumber").value(hasItem(DEFAULT_LICENSE_NUMBER)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getDriver() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get the driver
        restDriverMockMvc
            .perform(get(ENTITY_API_URL_ID, driver.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(driver.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.phone").value(DEFAULT_PHONE))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            .andExpect(jsonPath("$.licenseNumber").value(DEFAULT_LICENSE_NUMBER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getDriversByIdFiltering() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        Long id = driver.getId();

        defaultDriverFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultDriverFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultDriverFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllDriversByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where code equals to
        defaultDriverFiltering("code.equals=" + DEFAULT_CODE, "code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllDriversByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where code in
        defaultDriverFiltering("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE, "code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllDriversByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where code is not null
        defaultDriverFiltering("code.specified=true", "code.specified=false");
    }

    @Test
    @Transactional
    void getAllDriversByCodeContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where code contains
        defaultDriverFiltering("code.contains=" + DEFAULT_CODE, "code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllDriversByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where code does not contain
        defaultDriverFiltering("code.doesNotContain=" + UPDATED_CODE, "code.doesNotContain=" + DEFAULT_CODE);
    }

    @Test
    @Transactional
    void getAllDriversByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where name equals to
        defaultDriverFiltering("name.equals=" + DEFAULT_NAME, "name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDriversByNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where name in
        defaultDriverFiltering("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME, "name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDriversByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where name is not null
        defaultDriverFiltering("name.specified=true", "name.specified=false");
    }

    @Test
    @Transactional
    void getAllDriversByNameContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where name contains
        defaultDriverFiltering("name.contains=" + DEFAULT_NAME, "name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDriversByNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where name does not contain
        defaultDriverFiltering("name.doesNotContain=" + UPDATED_NAME, "name.doesNotContain=" + DEFAULT_NAME);
    }

    @Test
    @Transactional
    void getAllDriversByPhoneIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where phone equals to
        defaultDriverFiltering("phone.equals=" + DEFAULT_PHONE, "phone.equals=" + UPDATED_PHONE);
    }

    @Test
    @Transactional
    void getAllDriversByPhoneIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where phone in
        defaultDriverFiltering("phone.in=" + DEFAULT_PHONE + "," + UPDATED_PHONE, "phone.in=" + UPDATED_PHONE);
    }

    @Test
    @Transactional
    void getAllDriversByPhoneIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where phone is not null
        defaultDriverFiltering("phone.specified=true", "phone.specified=false");
    }

    @Test
    @Transactional
    void getAllDriversByPhoneContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where phone contains
        defaultDriverFiltering("phone.contains=" + DEFAULT_PHONE, "phone.contains=" + UPDATED_PHONE);
    }

    @Test
    @Transactional
    void getAllDriversByPhoneNotContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where phone does not contain
        defaultDriverFiltering("phone.doesNotContain=" + UPDATED_PHONE, "phone.doesNotContain=" + DEFAULT_PHONE);
    }

    @Test
    @Transactional
    void getAllDriversByEmailIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where email equals to
        defaultDriverFiltering("email.equals=" + DEFAULT_EMAIL, "email.equals=" + UPDATED_EMAIL);
    }

    @Test
    @Transactional
    void getAllDriversByEmailIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where email in
        defaultDriverFiltering("email.in=" + DEFAULT_EMAIL + "," + UPDATED_EMAIL, "email.in=" + UPDATED_EMAIL);
    }

    @Test
    @Transactional
    void getAllDriversByEmailIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where email is not null
        defaultDriverFiltering("email.specified=true", "email.specified=false");
    }

    @Test
    @Transactional
    void getAllDriversByEmailContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where email contains
        defaultDriverFiltering("email.contains=" + DEFAULT_EMAIL, "email.contains=" + UPDATED_EMAIL);
    }

    @Test
    @Transactional
    void getAllDriversByEmailNotContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where email does not contain
        defaultDriverFiltering("email.doesNotContain=" + UPDATED_EMAIL, "email.doesNotContain=" + DEFAULT_EMAIL);
    }

    @Test
    @Transactional
    void getAllDriversByLicenseNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where licenseNumber equals to
        defaultDriverFiltering("licenseNumber.equals=" + DEFAULT_LICENSE_NUMBER, "licenseNumber.equals=" + UPDATED_LICENSE_NUMBER);
    }

    @Test
    @Transactional
    void getAllDriversByLicenseNumberIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where licenseNumber in
        defaultDriverFiltering(
            "licenseNumber.in=" + DEFAULT_LICENSE_NUMBER + "," + UPDATED_LICENSE_NUMBER,
            "licenseNumber.in=" + UPDATED_LICENSE_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllDriversByLicenseNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where licenseNumber is not null
        defaultDriverFiltering("licenseNumber.specified=true", "licenseNumber.specified=false");
    }

    @Test
    @Transactional
    void getAllDriversByLicenseNumberContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where licenseNumber contains
        defaultDriverFiltering("licenseNumber.contains=" + DEFAULT_LICENSE_NUMBER, "licenseNumber.contains=" + UPDATED_LICENSE_NUMBER);
    }

    @Test
    @Transactional
    void getAllDriversByLicenseNumberNotContainsSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where licenseNumber does not contain
        defaultDriverFiltering(
            "licenseNumber.doesNotContain=" + UPDATED_LICENSE_NUMBER,
            "licenseNumber.doesNotContain=" + DEFAULT_LICENSE_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllDriversByActiveIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where active equals to
        defaultDriverFiltering("active.equals=" + DEFAULT_ACTIVE, "active.equals=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllDriversByActiveIsInShouldWork() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where active in
        defaultDriverFiltering("active.in=" + DEFAULT_ACTIVE + "," + UPDATED_ACTIVE, "active.in=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllDriversByActiveIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        // Get all the driverList where active is not null
        defaultDriverFiltering("active.specified=true", "active.specified=false");
    }

    @Test
    @Transactional
    void getAllDriversByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            driverRepository.saveAndFlush(driver);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        driver.setTenant(tenant);
        driverRepository.saveAndFlush(driver);
        Long tenantId = tenant.getId();
        // Get all the driverList where tenant equals to tenantId
        defaultDriverShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the driverList where tenant equals to (tenantId + 1)
        defaultDriverShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    @Test
    @Transactional
    void getAllDriversByVehicleIsEqualToSomething() throws Exception {
        Vehicle vehicle;
        if (TestUtil.findAll(em, Vehicle.class).isEmpty()) {
            driverRepository.saveAndFlush(driver);
            vehicle = VehicleResourceIT.createEntity(em);
        } else {
            vehicle = TestUtil.findAll(em, Vehicle.class).get(0);
        }
        em.persist(vehicle);
        em.flush();
        driver.setVehicle(vehicle);
        driverRepository.saveAndFlush(driver);
        Long vehicleId = vehicle.getId();
        // Get all the driverList where vehicle equals to vehicleId
        defaultDriverShouldBeFound("vehicleId.equals=" + vehicleId);

        // Get all the driverList where vehicle equals to (vehicleId + 1)
        defaultDriverShouldNotBeFound("vehicleId.equals=" + (vehicleId + 1));
    }

    private void defaultDriverFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultDriverShouldBeFound(shouldBeFound);
        defaultDriverShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultDriverShouldBeFound(String filter) throws Exception {
        restDriverMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(driver.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].licenseNumber").value(hasItem(DEFAULT_LICENSE_NUMBER)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));

        // Check, that the count call also returns 1
        restDriverMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultDriverShouldNotBeFound(String filter) throws Exception {
        restDriverMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restDriverMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingDriver() throws Exception {
        // Get the driver
        restDriverMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDriver() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the driver
        Driver updatedDriver = driverRepository.findById(driver.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDriver are not directly saved in db
        em.detach(updatedDriver);
        updatedDriver
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .phone(UPDATED_PHONE)
            .email(UPDATED_EMAIL)
            .licenseNumber(UPDATED_LICENSE_NUMBER)
            .active(UPDATED_ACTIVE);
        DriverDTO driverDTO = driverMapper.toDto(updatedDriver);

        restDriverMockMvc
            .perform(
                put(ENTITY_API_URL_ID, driverDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO))
            )
            .andExpect(status().isOk());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDriverToMatchAllProperties(updatedDriver);
    }

    @Test
    @Transactional
    void putNonExistingDriver() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        driver.setId(longCount.incrementAndGet());

        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDriverMockMvc
            .perform(
                put(ENTITY_API_URL_ID, driverDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDriver() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        driver.setId(longCount.incrementAndGet());

        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDriverMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(driverDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDriver() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        driver.setId(longCount.incrementAndGet());

        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDriverMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(driverDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDriverWithPatch() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the driver using partial update
        Driver partialUpdatedDriver = new Driver();
        partialUpdatedDriver.setId(driver.getId());

        partialUpdatedDriver.phone(UPDATED_PHONE).active(UPDATED_ACTIVE);

        restDriverMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDriver.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDriver))
            )
            .andExpect(status().isOk());

        // Validate the Driver in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDriverUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedDriver, driver), getPersistedDriver(driver));
    }

    @Test
    @Transactional
    void fullUpdateDriverWithPatch() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the driver using partial update
        Driver partialUpdatedDriver = new Driver();
        partialUpdatedDriver.setId(driver.getId());

        partialUpdatedDriver
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .phone(UPDATED_PHONE)
            .email(UPDATED_EMAIL)
            .licenseNumber(UPDATED_LICENSE_NUMBER)
            .active(UPDATED_ACTIVE);

        restDriverMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDriver.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDriver))
            )
            .andExpect(status().isOk());

        // Validate the Driver in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDriverUpdatableFieldsEquals(partialUpdatedDriver, getPersistedDriver(partialUpdatedDriver));
    }

    @Test
    @Transactional
    void patchNonExistingDriver() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        driver.setId(longCount.incrementAndGet());

        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDriverMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, driverDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(driverDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDriver() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        driver.setId(longCount.incrementAndGet());

        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDriverMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(driverDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDriver() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        driver.setId(longCount.incrementAndGet());

        // Create the Driver
        DriverDTO driverDTO = driverMapper.toDto(driver);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDriverMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(driverDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Driver in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDriver() throws Exception {
        // Initialize the database
        insertedDriver = driverRepository.saveAndFlush(driver);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the driver
        restDriverMockMvc
            .perform(delete(ENTITY_API_URL_ID, driver.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return driverRepository.count();
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

    protected Driver getPersistedDriver(Driver driver) {
        return driverRepository.findById(driver.getId()).orElseThrow();
    }

    protected void assertPersistedDriverToMatchAllProperties(Driver expectedDriver) {
        assertDriverAllPropertiesEquals(expectedDriver, getPersistedDriver(expectedDriver));
    }

    protected void assertPersistedDriverToMatchUpdatableProperties(Driver expectedDriver) {
        assertDriverAllUpdatablePropertiesEquals(expectedDriver, getPersistedDriver(expectedDriver));
    }
}
