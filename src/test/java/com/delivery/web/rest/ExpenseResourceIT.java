package com.delivery.web.rest;

import static com.delivery.domain.ExpenseAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static com.delivery.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.Driver;
import com.delivery.domain.Expense;
import com.delivery.domain.ExpenseCategory;
import com.delivery.domain.Tenant;
import com.delivery.repository.ExpenseRepository;
import com.delivery.service.dto.ExpenseDTO;
import com.delivery.service.mapper.ExpenseMapper;
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
 * Integration tests for the {@link ExpenseResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ExpenseResourceIT {

    private static final LocalDate DEFAULT_EXPENSE_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_EXPENSE_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_EXPENSE_DATE = LocalDate.ofEpochDay(-1L);

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_AMOUNT = new BigDecimal(1 - 1);

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_RECEIPT_URL = "AAAAAAAAAA";
    private static final String UPDATED_RECEIPT_URL = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/expenses";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseMapper expenseMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restExpenseMockMvc;

    private Expense expense;

    private Expense insertedExpense;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Expense createEntity(EntityManager em) {
        Expense expense = new Expense()
            .expenseDate(DEFAULT_EXPENSE_DATE)
            .amount(DEFAULT_AMOUNT)
            .description(DEFAULT_DESCRIPTION)
            .receiptUrl(DEFAULT_RECEIPT_URL);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        expense.setTenant(tenant);
        // Add required entity
        ExpenseCategory expenseCategory;
        if (TestUtil.findAll(em, ExpenseCategory.class).isEmpty()) {
            expenseCategory = ExpenseCategoryResourceIT.createEntity(em);
            em.persist(expenseCategory);
            em.flush();
        } else {
            expenseCategory = TestUtil.findAll(em, ExpenseCategory.class).get(0);
        }
        expense.setCategory(expenseCategory);
        return expense;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Expense createUpdatedEntity(EntityManager em) {
        Expense updatedExpense = new Expense()
            .expenseDate(UPDATED_EXPENSE_DATE)
            .amount(UPDATED_AMOUNT)
            .description(UPDATED_DESCRIPTION)
            .receiptUrl(UPDATED_RECEIPT_URL);
        // Add required entity
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            tenant = TenantResourceIT.createUpdatedEntity();
            em.persist(tenant);
            em.flush();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        updatedExpense.setTenant(tenant);
        // Add required entity
        ExpenseCategory expenseCategory;
        if (TestUtil.findAll(em, ExpenseCategory.class).isEmpty()) {
            expenseCategory = ExpenseCategoryResourceIT.createUpdatedEntity(em);
            em.persist(expenseCategory);
            em.flush();
        } else {
            expenseCategory = TestUtil.findAll(em, ExpenseCategory.class).get(0);
        }
        updatedExpense.setCategory(expenseCategory);
        return updatedExpense;
    }

    @BeforeEach
    void initTest() {
        expense = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedExpense != null) {
            expenseRepository.delete(insertedExpense);
            insertedExpense = null;
        }
    }

    @Test
    @Transactional
    void createExpense() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);
        var returnedExpenseDTO = om.readValue(
            restExpenseMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ExpenseDTO.class
        );

        // Validate the Expense in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedExpense = expenseMapper.toEntity(returnedExpenseDTO);
        assertExpenseUpdatableFieldsEquals(returnedExpense, getPersistedExpense(returnedExpense));

        insertedExpense = returnedExpense;
    }

    @Test
    @Transactional
    void createExpenseWithExistingId() throws Exception {
        // Create the Expense with an existing ID
        expense.setId(1L);
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restExpenseMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkExpenseDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        expense.setExpenseDate(null);

        // Create the Expense, which fails.
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        restExpenseMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        expense.setAmount(null);

        // Create the Expense, which fails.
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        restExpenseMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllExpenses() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList
        restExpenseMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expense.getId().intValue())))
            .andExpect(jsonPath("$.[*].expenseDate").value(hasItem(DEFAULT_EXPENSE_DATE.toString())))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].receiptUrl").value(hasItem(DEFAULT_RECEIPT_URL)));
    }

    @Test
    @Transactional
    void getExpense() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get the expense
        restExpenseMockMvc
            .perform(get(ENTITY_API_URL_ID, expense.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(expense.getId().intValue()))
            .andExpect(jsonPath("$.expenseDate").value(DEFAULT_EXPENSE_DATE.toString()))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.receiptUrl").value(DEFAULT_RECEIPT_URL));
    }

    @Test
    @Transactional
    void getExpensesByIdFiltering() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        Long id = expense.getId();

        defaultExpenseFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultExpenseFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultExpenseFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate equals to
        defaultExpenseFiltering("expenseDate.equals=" + DEFAULT_EXPENSE_DATE, "expenseDate.equals=" + UPDATED_EXPENSE_DATE);
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate in
        defaultExpenseFiltering(
            "expenseDate.in=" + DEFAULT_EXPENSE_DATE + "," + UPDATED_EXPENSE_DATE,
            "expenseDate.in=" + UPDATED_EXPENSE_DATE
        );
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate is not null
        defaultExpenseFiltering("expenseDate.specified=true", "expenseDate.specified=false");
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate is greater than or equal to
        defaultExpenseFiltering(
            "expenseDate.greaterThanOrEqual=" + DEFAULT_EXPENSE_DATE,
            "expenseDate.greaterThanOrEqual=" + UPDATED_EXPENSE_DATE
        );
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate is less than or equal to
        defaultExpenseFiltering(
            "expenseDate.lessThanOrEqual=" + DEFAULT_EXPENSE_DATE,
            "expenseDate.lessThanOrEqual=" + SMALLER_EXPENSE_DATE
        );
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate is less than
        defaultExpenseFiltering("expenseDate.lessThan=" + UPDATED_EXPENSE_DATE, "expenseDate.lessThan=" + DEFAULT_EXPENSE_DATE);
    }

    @Test
    @Transactional
    void getAllExpensesByExpenseDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where expenseDate is greater than
        defaultExpenseFiltering("expenseDate.greaterThan=" + SMALLER_EXPENSE_DATE, "expenseDate.greaterThan=" + DEFAULT_EXPENSE_DATE);
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount equals to
        defaultExpenseFiltering("amount.equals=" + DEFAULT_AMOUNT, "amount.equals=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount in
        defaultExpenseFiltering("amount.in=" + DEFAULT_AMOUNT + "," + UPDATED_AMOUNT, "amount.in=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount is not null
        defaultExpenseFiltering("amount.specified=true", "amount.specified=false");
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount is greater than or equal to
        defaultExpenseFiltering("amount.greaterThanOrEqual=" + DEFAULT_AMOUNT, "amount.greaterThanOrEqual=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount is less than or equal to
        defaultExpenseFiltering("amount.lessThanOrEqual=" + DEFAULT_AMOUNT, "amount.lessThanOrEqual=" + SMALLER_AMOUNT);
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount is less than
        defaultExpenseFiltering("amount.lessThan=" + UPDATED_AMOUNT, "amount.lessThan=" + DEFAULT_AMOUNT);
    }

    @Test
    @Transactional
    void getAllExpensesByAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where amount is greater than
        defaultExpenseFiltering("amount.greaterThan=" + SMALLER_AMOUNT, "amount.greaterThan=" + DEFAULT_AMOUNT);
    }

    @Test
    @Transactional
    void getAllExpensesByReceiptUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where receiptUrl equals to
        defaultExpenseFiltering("receiptUrl.equals=" + DEFAULT_RECEIPT_URL, "receiptUrl.equals=" + UPDATED_RECEIPT_URL);
    }

    @Test
    @Transactional
    void getAllExpensesByReceiptUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where receiptUrl in
        defaultExpenseFiltering("receiptUrl.in=" + DEFAULT_RECEIPT_URL + "," + UPDATED_RECEIPT_URL, "receiptUrl.in=" + UPDATED_RECEIPT_URL);
    }

    @Test
    @Transactional
    void getAllExpensesByReceiptUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where receiptUrl is not null
        defaultExpenseFiltering("receiptUrl.specified=true", "receiptUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllExpensesByReceiptUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where receiptUrl contains
        defaultExpenseFiltering("receiptUrl.contains=" + DEFAULT_RECEIPT_URL, "receiptUrl.contains=" + UPDATED_RECEIPT_URL);
    }

    @Test
    @Transactional
    void getAllExpensesByReceiptUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        // Get all the expenseList where receiptUrl does not contain
        defaultExpenseFiltering("receiptUrl.doesNotContain=" + UPDATED_RECEIPT_URL, "receiptUrl.doesNotContain=" + DEFAULT_RECEIPT_URL);
    }

    @Test
    @Transactional
    void getAllExpensesByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            expenseRepository.saveAndFlush(expense);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        expense.setTenant(tenant);
        expenseRepository.saveAndFlush(expense);
        Long tenantId = tenant.getId();
        // Get all the expenseList where tenant equals to tenantId
        defaultExpenseShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the expenseList where tenant equals to (tenantId + 1)
        defaultExpenseShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    @Test
    @Transactional
    void getAllExpensesByCategoryIsEqualToSomething() throws Exception {
        ExpenseCategory category;
        if (TestUtil.findAll(em, ExpenseCategory.class).isEmpty()) {
            expenseRepository.saveAndFlush(expense);
            category = ExpenseCategoryResourceIT.createEntity(em);
        } else {
            category = TestUtil.findAll(em, ExpenseCategory.class).get(0);
        }
        em.persist(category);
        em.flush();
        expense.setCategory(category);
        expenseRepository.saveAndFlush(expense);
        Long categoryId = category.getId();
        // Get all the expenseList where category equals to categoryId
        defaultExpenseShouldBeFound("categoryId.equals=" + categoryId);

        // Get all the expenseList where category equals to (categoryId + 1)
        defaultExpenseShouldNotBeFound("categoryId.equals=" + (categoryId + 1));
    }

    @Test
    @Transactional
    void getAllExpensesByDriverIsEqualToSomething() throws Exception {
        Driver driver;
        if (TestUtil.findAll(em, Driver.class).isEmpty()) {
            expenseRepository.saveAndFlush(expense);
            driver = DriverResourceIT.createEntity(em);
        } else {
            driver = TestUtil.findAll(em, Driver.class).get(0);
        }
        em.persist(driver);
        em.flush();
        expense.setDriver(driver);
        expenseRepository.saveAndFlush(expense);
        Long driverId = driver.getId();
        // Get all the expenseList where driver equals to driverId
        defaultExpenseShouldBeFound("driverId.equals=" + driverId);

        // Get all the expenseList where driver equals to (driverId + 1)
        defaultExpenseShouldNotBeFound("driverId.equals=" + (driverId + 1));
    }

    private void defaultExpenseFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultExpenseShouldBeFound(shouldBeFound);
        defaultExpenseShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultExpenseShouldBeFound(String filter) throws Exception {
        restExpenseMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expense.getId().intValue())))
            .andExpect(jsonPath("$.[*].expenseDate").value(hasItem(DEFAULT_EXPENSE_DATE.toString())))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].receiptUrl").value(hasItem(DEFAULT_RECEIPT_URL)));

        // Check, that the count call also returns 1
        restExpenseMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultExpenseShouldNotBeFound(String filter) throws Exception {
        restExpenseMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restExpenseMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingExpense() throws Exception {
        // Get the expense
        restExpenseMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingExpense() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the expense
        Expense updatedExpense = expenseRepository.findById(expense.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedExpense are not directly saved in db
        em.detach(updatedExpense);
        updatedExpense
            .expenseDate(UPDATED_EXPENSE_DATE)
            .amount(UPDATED_AMOUNT)
            .description(UPDATED_DESCRIPTION)
            .receiptUrl(UPDATED_RECEIPT_URL);
        ExpenseDTO expenseDTO = expenseMapper.toDto(updatedExpense);

        restExpenseMockMvc
            .perform(
                put(ENTITY_API_URL_ID, expenseDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO))
            )
            .andExpect(status().isOk());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedExpenseToMatchAllProperties(updatedExpense);
    }

    @Test
    @Transactional
    void putNonExistingExpense() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expense.setId(longCount.incrementAndGet());

        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseMockMvc
            .perform(
                put(ENTITY_API_URL_ID, expenseDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchExpense() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expense.setId(longCount.incrementAndGet());

        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(expenseDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamExpense() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expense.setId(longCount.incrementAndGet());

        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateExpenseWithPatch() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the expense using partial update
        Expense partialUpdatedExpense = new Expense();
        partialUpdatedExpense.setId(expense.getId());

        partialUpdatedExpense.receiptUrl(UPDATED_RECEIPT_URL);

        restExpenseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedExpense.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedExpense))
            )
            .andExpect(status().isOk());

        // Validate the Expense in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertExpenseUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedExpense, expense), getPersistedExpense(expense));
    }

    @Test
    @Transactional
    void fullUpdateExpenseWithPatch() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the expense using partial update
        Expense partialUpdatedExpense = new Expense();
        partialUpdatedExpense.setId(expense.getId());

        partialUpdatedExpense
            .expenseDate(UPDATED_EXPENSE_DATE)
            .amount(UPDATED_AMOUNT)
            .description(UPDATED_DESCRIPTION)
            .receiptUrl(UPDATED_RECEIPT_URL);

        restExpenseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedExpense.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedExpense))
            )
            .andExpect(status().isOk());

        // Validate the Expense in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertExpenseUpdatableFieldsEquals(partialUpdatedExpense, getPersistedExpense(partialUpdatedExpense));
    }

    @Test
    @Transactional
    void patchNonExistingExpense() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expense.setId(longCount.incrementAndGet());

        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, expenseDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(expenseDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchExpense() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expense.setId(longCount.incrementAndGet());

        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(expenseDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamExpense() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expense.setId(longCount.incrementAndGet());

        // Create the Expense
        ExpenseDTO expenseDTO = expenseMapper.toDto(expense);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(expenseDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Expense in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteExpense() throws Exception {
        // Initialize the database
        insertedExpense = expenseRepository.saveAndFlush(expense);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the expense
        restExpenseMockMvc
            .perform(delete(ENTITY_API_URL_ID, expense.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return expenseRepository.count();
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

    protected Expense getPersistedExpense(Expense expense) {
        return expenseRepository.findById(expense.getId()).orElseThrow();
    }

    protected void assertPersistedExpenseToMatchAllProperties(Expense expectedExpense) {
        assertExpenseAllPropertiesEquals(expectedExpense, getPersistedExpense(expectedExpense));
    }

    protected void assertPersistedExpenseToMatchUpdatableProperties(Expense expectedExpense) {
        assertExpenseAllUpdatablePropertiesEquals(expectedExpense, getPersistedExpense(expectedExpense));
    }
}
