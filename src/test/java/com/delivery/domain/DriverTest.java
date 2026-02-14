package com.delivery.domain;

import static com.delivery.domain.DriverTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static com.delivery.domain.VehicleTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DriverTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Driver.class);
        Driver driver1 = getDriverSample1();
        Driver driver2 = new Driver();
        assertThat(driver1).isNotEqualTo(driver2);

        driver2.setId(driver1.getId());
        assertThat(driver1).isEqualTo(driver2);

        driver2 = getDriverSample2();
        assertThat(driver1).isNotEqualTo(driver2);
    }

    @Test
    void tenantTest() {
        Driver driver = getDriverRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        driver.setTenant(tenantBack);
        assertThat(driver.getTenant()).isEqualTo(tenantBack);

        driver.tenant(null);
        assertThat(driver.getTenant()).isNull();
    }

    @Test
    void vehicleTest() {
        Driver driver = getDriverRandomSampleGenerator();
        Vehicle vehicleBack = getVehicleRandomSampleGenerator();

        driver.setVehicle(vehicleBack);
        assertThat(driver.getVehicle()).isEqualTo(vehicleBack);

        driver.vehicle(null);
        assertThat(driver.getVehicle()).isNull();
    }
}
