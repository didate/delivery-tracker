package com.delivery.domain;

import static com.delivery.domain.TenantTestSamples.*;
import static com.delivery.domain.VehicleTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class VehicleTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Vehicle.class);
        Vehicle vehicle1 = getVehicleSample1();
        Vehicle vehicle2 = new Vehicle();
        assertThat(vehicle1).isNotEqualTo(vehicle2);

        vehicle2.setId(vehicle1.getId());
        assertThat(vehicle1).isEqualTo(vehicle2);

        vehicle2 = getVehicleSample2();
        assertThat(vehicle1).isNotEqualTo(vehicle2);
    }

    @Test
    void tenantTest() {
        Vehicle vehicle = getVehicleRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        vehicle.setTenant(tenantBack);
        assertThat(vehicle.getTenant()).isEqualTo(tenantBack);

        vehicle.tenant(null);
        assertThat(vehicle.getTenant()).isNull();
    }
}
