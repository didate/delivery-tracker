package com.delivery.domain;

import static com.delivery.domain.DriverTestSamples.*;
import static com.delivery.domain.RoundTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoundTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Round.class);
        Round round1 = getRoundSample1();
        Round round2 = new Round();
        assertThat(round1).isNotEqualTo(round2);

        round2.setId(round1.getId());
        assertThat(round1).isEqualTo(round2);

        round2 = getRoundSample2();
        assertThat(round1).isNotEqualTo(round2);
    }

    @Test
    void tenantTest() {
        Round round = getRoundRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        round.setTenant(tenantBack);
        assertThat(round.getTenant()).isEqualTo(tenantBack);

        round.tenant(null);
        assertThat(round.getTenant()).isNull();
    }

    @Test
    void driverTest() {
        Round round = getRoundRandomSampleGenerator();
        Driver driverBack = getDriverRandomSampleGenerator();

        round.setDriver(driverBack);
        assertThat(round.getDriver()).isEqualTo(driverBack);

        round.driver(null);
        assertThat(round.getDriver()).isNull();
    }
}
