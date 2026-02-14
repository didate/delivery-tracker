package com.delivery.domain;

import static com.delivery.domain.CustomerTestSamples.*;
import static com.delivery.domain.RoundCustomerTestSamples.*;
import static com.delivery.domain.RoundTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoundCustomerTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RoundCustomer.class);
        RoundCustomer roundCustomer1 = getRoundCustomerSample1();
        RoundCustomer roundCustomer2 = new RoundCustomer();
        assertThat(roundCustomer1).isNotEqualTo(roundCustomer2);

        roundCustomer2.setId(roundCustomer1.getId());
        assertThat(roundCustomer1).isEqualTo(roundCustomer2);

        roundCustomer2 = getRoundCustomerSample2();
        assertThat(roundCustomer1).isNotEqualTo(roundCustomer2);
    }

    @Test
    void roundTest() {
        RoundCustomer roundCustomer = getRoundCustomerRandomSampleGenerator();
        Round roundBack = getRoundRandomSampleGenerator();

        roundCustomer.setRound(roundBack);
        assertThat(roundCustomer.getRound()).isEqualTo(roundBack);

        roundCustomer.round(null);
        assertThat(roundCustomer.getRound()).isNull();
    }

    @Test
    void customerTest() {
        RoundCustomer roundCustomer = getRoundCustomerRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        roundCustomer.setCustomer(customerBack);
        assertThat(roundCustomer.getCustomer()).isEqualTo(customerBack);

        roundCustomer.customer(null);
        assertThat(roundCustomer.getCustomer()).isNull();
    }
}
