package com.delivery.web.rest;

import static com.delivery.domain.ExpenseCategoryAsserts.*;
import static com.delivery.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.delivery.IntegrationTest;
import com.delivery.domain.ExpenseCategory;
import com.delivery.domain.Tenant;
import com.delivery.repository.ExpenseCategoryRepository;
import com.delivery.service.dto.ExpenseCategoryDTO;
import com.delivery.service.mapper.ExpenseCategoryMapper;
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
 * Integration tests for the {@link ExpenseCategoryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ExpenseCategoryResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/expense-categories";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ExpenseCategoryRepository expenseCategoryRepository;

    @Autowired
    private ExpenseCategoryMapper expenseCategoryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restExpenseCategoryMockMvc;

    private ExpenseCategory expenseCategory;

    private ExpenseCategory insertedExpenseCategory;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ExpenseCategory createEntity(EntityManager em) {
        ExpenseCategory expenseCategory = new ExpenseCategory()
            .code(DEFAULT_CODE)
            .name(DEFAULT_NAME)
            .description(DEFAULT_DESCRIPTION)
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
        expenseCategory.setTenant(tenant);
        return expenseCategory;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ExpenseCategory createUpdatedEntity(EntityManager em) {
        ExpenseCategory updatedExpenseCategory = new ExpenseCategory()
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
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
        updatedExpenseCategory.setTenant(tenant);
        return updatedExpenseCategory;
    }

    @BeforeEach
    void initTest() {
        expenseCategory = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedExpenseCategory != null) {
            expenseCategoryRepository.delete(insertedExpenseCategory);
            insertedExpenseCategory = null;
        }
    }

    @Test
    @Transactional
    void createExpenseCategory() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);
        var returnedExpenseCategoryDTO = om.readValue(
            restExpenseCategoryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseCategoryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ExpenseCategoryDTO.class
        );

        // Validate the ExpenseCategory in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedExpenseCategory = expenseCategoryMapper.toEntity(returnedExpenseCategoryDTO);
        assertExpenseCategoryUpdatableFieldsEquals(returnedExpenseCategory, getPersistedExpenseCategory(returnedExpenseCategory));

        insertedExpenseCategory = returnedExpenseCategory;
    }

    @Test
    @Transactional
    void createExpenseCategoryWithExistingId() throws Exception {
        // Create the ExpenseCategory with an existing ID
        expenseCategory.setId(1L);
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restExpenseCategoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseCategoryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        expenseCategory.setCode(null);

        // Create the ExpenseCategory, which fails.
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        restExpenseCategoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseCategoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        expenseCategory.setName(null);

        // Create the ExpenseCategory, which fails.
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        restExpenseCategoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseCategoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        expenseCategory.setActive(null);

        // Create the ExpenseCategory, which fails.
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        restExpenseCategoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseCategoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllExpenseCategories() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList
        restExpenseCategoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expenseCategory.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getExpenseCategory() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get the expenseCategory
        restExpenseCategoryMockMvc
            .perform(get(ENTITY_API_URL_ID, expenseCategory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(expenseCategory.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getExpenseCategoriesByIdFiltering() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        Long id = expenseCategory.getId();

        defaultExpenseCategoryFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultExpenseCategoryFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultExpenseCategoryFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where code equals to
        defaultExpenseCategoryFiltering("code.equals=" + DEFAULT_CODE, "code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where code in
        defaultExpenseCategoryFiltering("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE, "code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where code is not null
        defaultExpenseCategoryFiltering("code.specified=true", "code.specified=false");
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByCodeContainsSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where code contains
        defaultExpenseCategoryFiltering("code.contains=" + DEFAULT_CODE, "code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where code does not contain
        defaultExpenseCategoryFiltering("code.doesNotContain=" + UPDATED_CODE, "code.doesNotContain=" + DEFAULT_CODE);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where name equals to
        defaultExpenseCategoryFiltering("name.equals=" + DEFAULT_NAME, "name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where name in
        defaultExpenseCategoryFiltering("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME, "name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where name is not null
        defaultExpenseCategoryFiltering("name.specified=true", "name.specified=false");
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByNameContainsSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where name contains
        defaultExpenseCategoryFiltering("name.contains=" + DEFAULT_NAME, "name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where name does not contain
        defaultExpenseCategoryFiltering("name.doesNotContain=" + UPDATED_NAME, "name.doesNotContain=" + DEFAULT_NAME);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByActiveIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where active equals to
        defaultExpenseCategoryFiltering("active.equals=" + DEFAULT_ACTIVE, "active.equals=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByActiveIsInShouldWork() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where active in
        defaultExpenseCategoryFiltering("active.in=" + DEFAULT_ACTIVE + "," + UPDATED_ACTIVE, "active.in=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByActiveIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        // Get all the expenseCategoryList where active is not null
        defaultExpenseCategoryFiltering("active.specified=true", "active.specified=false");
    }

    @Test
    @Transactional
    void getAllExpenseCategoriesByTenantIsEqualToSomething() throws Exception {
        Tenant tenant;
        if (TestUtil.findAll(em, Tenant.class).isEmpty()) {
            expenseCategoryRepository.saveAndFlush(expenseCategory);
            tenant = TenantResourceIT.createEntity();
        } else {
            tenant = TestUtil.findAll(em, Tenant.class).get(0);
        }
        em.persist(tenant);
        em.flush();
        expenseCategory.setTenant(tenant);
        expenseCategoryRepository.saveAndFlush(expenseCategory);
        Long tenantId = tenant.getId();
        // Get all the expenseCategoryList where tenant equals to tenantId
        defaultExpenseCategoryShouldBeFound("tenantId.equals=" + tenantId);

        // Get all the expenseCategoryList where tenant equals to (tenantId + 1)
        defaultExpenseCategoryShouldNotBeFound("tenantId.equals=" + (tenantId + 1));
    }

    private void defaultExpenseCategoryFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultExpenseCategoryShouldBeFound(shouldBeFound);
        defaultExpenseCategoryShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultExpenseCategoryShouldBeFound(String filter) throws Exception {
        restExpenseCategoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expenseCategory.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));

        // Check, that the count call also returns 1
        restExpenseCategoryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultExpenseCategoryShouldNotBeFound(String filter) throws Exception {
        restExpenseCategoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restExpenseCategoryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingExpenseCategory() throws Exception {
        // Get the expenseCategory
        restExpenseCategoryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingExpenseCategory() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the expenseCategory
        ExpenseCategory updatedExpenseCategory = expenseCategoryRepository.findById(expenseCategory.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedExpenseCategory are not directly saved in db
        em.detach(updatedExpenseCategory);
        updatedExpenseCategory.code(UPDATED_CODE).name(UPDATED_NAME).description(UPDATED_DESCRIPTION).active(UPDATED_ACTIVE);
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(updatedExpenseCategory);

        restExpenseCategoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, expenseCategoryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(expenseCategoryDTO))
            )
            .andExpect(status().isOk());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedExpenseCategoryToMatchAllProperties(updatedExpenseCategory);
    }

    @Test
    @Transactional
    void putNonExistingExpenseCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expenseCategory.setId(longCount.incrementAndGet());

        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseCategoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, expenseCategoryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(expenseCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchExpenseCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expenseCategory.setId(longCount.incrementAndGet());

        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseCategoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(expenseCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamExpenseCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expenseCategory.setId(longCount.incrementAndGet());

        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseCategoryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(expenseCategoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateExpenseCategoryWithPatch() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the expenseCategory using partial update
        ExpenseCategory partialUpdatedExpenseCategory = new ExpenseCategory();
        partialUpdatedExpenseCategory.setId(expenseCategory.getId());

        partialUpdatedExpenseCategory.name(UPDATED_NAME).active(UPDATED_ACTIVE);

        restExpenseCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedExpenseCategory.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedExpenseCategory))
            )
            .andExpect(status().isOk());

        // Validate the ExpenseCategory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertExpenseCategoryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedExpenseCategory, expenseCategory),
            getPersistedExpenseCategory(expenseCategory)
        );
    }

    @Test
    @Transactional
    void fullUpdateExpenseCategoryWithPatch() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the expenseCategory using partial update
        ExpenseCategory partialUpdatedExpenseCategory = new ExpenseCategory();
        partialUpdatedExpenseCategory.setId(expenseCategory.getId());

        partialUpdatedExpenseCategory.code(UPDATED_CODE).name(UPDATED_NAME).description(UPDATED_DESCRIPTION).active(UPDATED_ACTIVE);

        restExpenseCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedExpenseCategory.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedExpenseCategory))
            )
            .andExpect(status().isOk());

        // Validate the ExpenseCategory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertExpenseCategoryUpdatableFieldsEquals(
            partialUpdatedExpenseCategory,
            getPersistedExpenseCategory(partialUpdatedExpenseCategory)
        );
    }

    @Test
    @Transactional
    void patchNonExistingExpenseCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expenseCategory.setId(longCount.incrementAndGet());

        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, expenseCategoryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(expenseCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchExpenseCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expenseCategory.setId(longCount.incrementAndGet());

        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(expenseCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamExpenseCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        expenseCategory.setId(longCount.incrementAndGet());

        // Create the ExpenseCategory
        ExpenseCategoryDTO expenseCategoryDTO = expenseCategoryMapper.toDto(expenseCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restExpenseCategoryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(expenseCategoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ExpenseCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteExpenseCategory() throws Exception {
        // Initialize the database
        insertedExpenseCategory = expenseCategoryRepository.saveAndFlush(expenseCategory);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the expenseCategory
        restExpenseCategoryMockMvc
            .perform(delete(ENTITY_API_URL_ID, expenseCategory.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return expenseCategoryRepository.count();
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

    protected ExpenseCategory getPersistedExpenseCategory(ExpenseCategory expenseCategory) {
        return expenseCategoryRepository.findById(expenseCategory.getId()).orElseThrow();
    }

    protected void assertPersistedExpenseCategoryToMatchAllProperties(ExpenseCategory expectedExpenseCategory) {
        assertExpenseCategoryAllPropertiesEquals(expectedExpenseCategory, getPersistedExpenseCategory(expectedExpenseCategory));
    }

    protected void assertPersistedExpenseCategoryToMatchUpdatableProperties(ExpenseCategory expectedExpenseCategory) {
        assertExpenseCategoryAllUpdatablePropertiesEquals(expectedExpenseCategory, getPersistedExpenseCategory(expectedExpenseCategory));
    }
}
