package com.delivery.domain;

import static com.delivery.domain.CustomerTestSamples.*;
import static com.delivery.domain.DeliveryTestSamples.*;
import static com.delivery.domain.DriverTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DeliveryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Delivery.class);
        Delivery delivery1 = getDeliverySample1();
        Delivery delivery2 = new Delivery();
        assertThat(delivery1).isNotEqualTo(delivery2);

        delivery2.setId(delivery1.getId());
        assertThat(delivery1).isEqualTo(delivery2);

        delivery2 = getDeliverySample2();
        assertThat(delivery1).isNotEqualTo(delivery2);
    }

    @Test
    void tenantTest() {
        Delivery delivery = getDeliveryRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        delivery.setTenant(tenantBack);
        assertThat(delivery.getTenant()).isEqualTo(tenantBack);

        delivery.tenant(null);
        assertThat(delivery.getTenant()).isNull();
    }

    @Test
    void customerTest() {
        Delivery delivery = getDeliveryRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        delivery.setCustomer(customerBack);
        assertThat(delivery.getCustomer()).isEqualTo(customerBack);

        delivery.customer(null);
        assertThat(delivery.getCustomer()).isNull();
    }

    @Test
    void driverTest() {
        Delivery delivery = getDeliveryRandomSampleGenerator();
        Driver driverBack = getDriverRandomSampleGenerator();

        delivery.setDriver(driverBack);
        assertThat(delivery.getDriver()).isEqualTo(driverBack);

        delivery.driver(null);
        assertThat(delivery.getDriver()).isNull();
    }
}
