package com.delivery.domain;

import static com.delivery.domain.CustomerTestSamples.*;
import static com.delivery.domain.DriverTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CustomerTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Customer.class);
        Customer customer1 = getCustomerSample1();
        Customer customer2 = new Customer();
        assertThat(customer1).isNotEqualTo(customer2);

        customer2.setId(customer1.getId());
        assertThat(customer1).isEqualTo(customer2);

        customer2 = getCustomerSample2();
        assertThat(customer1).isNotEqualTo(customer2);
    }

    @Test
    void tenantTest() {
        Customer customer = getCustomerRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        customer.setTenant(tenantBack);
        assertThat(customer.getTenant()).isEqualTo(tenantBack);

        customer.tenant(null);
        assertThat(customer.getTenant()).isNull();
    }

    @Test
    void driverTest() {
        Customer customer = getCustomerRandomSampleGenerator();
        Driver driverBack = getDriverRandomSampleGenerator();

        customer.setDriver(driverBack);
        assertThat(customer.getDriver()).isEqualTo(driverBack);

        customer.driver(null);
        assertThat(customer.getDriver()).isNull();
    }
}
