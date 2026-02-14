package com.delivery.domain;

import static com.delivery.domain.CustomerTestSamples.*;
import static com.delivery.domain.DeliveryTestSamples.*;
import static com.delivery.domain.PaymentTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PaymentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Payment.class);
        Payment payment1 = getPaymentSample1();
        Payment payment2 = new Payment();
        assertThat(payment1).isNotEqualTo(payment2);

        payment2.setId(payment1.getId());
        assertThat(payment1).isEqualTo(payment2);

        payment2 = getPaymentSample2();
        assertThat(payment1).isNotEqualTo(payment2);
    }

    @Test
    void tenantTest() {
        Payment payment = getPaymentRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        payment.setTenant(tenantBack);
        assertThat(payment.getTenant()).isEqualTo(tenantBack);

        payment.tenant(null);
        assertThat(payment.getTenant()).isNull();
    }

    @Test
    void customerTest() {
        Payment payment = getPaymentRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        payment.setCustomer(customerBack);
        assertThat(payment.getCustomer()).isEqualTo(customerBack);

        payment.customer(null);
        assertThat(payment.getCustomer()).isNull();
    }

    @Test
    void deliveryTest() {
        Payment payment = getPaymentRandomSampleGenerator();
        Delivery deliveryBack = getDeliveryRandomSampleGenerator();

        payment.setDelivery(deliveryBack);
        assertThat(payment.getDelivery()).isEqualTo(deliveryBack);

        payment.delivery(null);
        assertThat(payment.getDelivery()).isNull();
    }
}
