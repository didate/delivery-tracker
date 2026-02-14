package com.delivery.domain;

import static com.delivery.domain.DriverTestSamples.*;
import static com.delivery.domain.ExpenseCategoryTestSamples.*;
import static com.delivery.domain.ExpenseTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ExpenseTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Expense.class);
        Expense expense1 = getExpenseSample1();
        Expense expense2 = new Expense();
        assertThat(expense1).isNotEqualTo(expense2);

        expense2.setId(expense1.getId());
        assertThat(expense1).isEqualTo(expense2);

        expense2 = getExpenseSample2();
        assertThat(expense1).isNotEqualTo(expense2);
    }

    @Test
    void tenantTest() {
        Expense expense = getExpenseRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        expense.setTenant(tenantBack);
        assertThat(expense.getTenant()).isEqualTo(tenantBack);

        expense.tenant(null);
        assertThat(expense.getTenant()).isNull();
    }

    @Test
    void categoryTest() {
        Expense expense = getExpenseRandomSampleGenerator();
        ExpenseCategory expenseCategoryBack = getExpenseCategoryRandomSampleGenerator();

        expense.setCategory(expenseCategoryBack);
        assertThat(expense.getCategory()).isEqualTo(expenseCategoryBack);

        expense.category(null);
        assertThat(expense.getCategory()).isNull();
    }

    @Test
    void driverTest() {
        Expense expense = getExpenseRandomSampleGenerator();
        Driver driverBack = getDriverRandomSampleGenerator();

        expense.setDriver(driverBack);
        assertThat(expense.getDriver()).isEqualTo(driverBack);

        expense.driver(null);
        assertThat(expense.getDriver()).isNull();
    }
}
