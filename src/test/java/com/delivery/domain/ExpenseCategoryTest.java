package com.delivery.domain;

import static com.delivery.domain.ExpenseCategoryTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ExpenseCategoryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseCategory.class);
        ExpenseCategory expenseCategory1 = getExpenseCategorySample1();
        ExpenseCategory expenseCategory2 = new ExpenseCategory();
        assertThat(expenseCategory1).isNotEqualTo(expenseCategory2);

        expenseCategory2.setId(expenseCategory1.getId());
        assertThat(expenseCategory1).isEqualTo(expenseCategory2);

        expenseCategory2 = getExpenseCategorySample2();
        assertThat(expenseCategory1).isNotEqualTo(expenseCategory2);
    }

    @Test
    void tenantTest() {
        ExpenseCategory expenseCategory = getExpenseCategoryRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        expenseCategory.setTenant(tenantBack);
        assertThat(expenseCategory.getTenant()).isEqualTo(tenantBack);

        expenseCategory.tenant(null);
        assertThat(expenseCategory.getTenant()).isNull();
    }
}
