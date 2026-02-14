package com.delivery.domain;

import static com.delivery.domain.CustomerTestSamples.*;
import static com.delivery.domain.DeliveryTestSamples.*;
import static com.delivery.domain.ProductReturnTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductReturnTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProductReturn.class);
        ProductReturn productReturn1 = getProductReturnSample1();
        ProductReturn productReturn2 = new ProductReturn();
        assertThat(productReturn1).isNotEqualTo(productReturn2);

        productReturn2.setId(productReturn1.getId());
        assertThat(productReturn1).isEqualTo(productReturn2);

        productReturn2 = getProductReturnSample2();
        assertThat(productReturn1).isNotEqualTo(productReturn2);
    }

    @Test
    void tenantTest() {
        ProductReturn productReturn = getProductReturnRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        productReturn.setTenant(tenantBack);
        assertThat(productReturn.getTenant()).isEqualTo(tenantBack);

        productReturn.tenant(null);
        assertThat(productReturn.getTenant()).isNull();
    }

    @Test
    void customerTest() {
        ProductReturn productReturn = getProductReturnRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        productReturn.setCustomer(customerBack);
        assertThat(productReturn.getCustomer()).isEqualTo(customerBack);

        productReturn.customer(null);
        assertThat(productReturn.getCustomer()).isNull();
    }

    @Test
    void deliveryTest() {
        ProductReturn productReturn = getProductReturnRandomSampleGenerator();
        Delivery deliveryBack = getDeliveryRandomSampleGenerator();

        productReturn.setDelivery(deliveryBack);
        assertThat(productReturn.getDelivery()).isEqualTo(deliveryBack);

        productReturn.delivery(null);
        assertThat(productReturn.getDelivery()).isNull();
    }
}
