package com.delivery.domain;

import static com.delivery.domain.TenantSettingsTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TenantSettingsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TenantSettings.class);
        TenantSettings tenantSettings1 = getTenantSettingsSample1();
        TenantSettings tenantSettings2 = new TenantSettings();
        assertThat(tenantSettings1).isNotEqualTo(tenantSettings2);

        tenantSettings2.setId(tenantSettings1.getId());
        assertThat(tenantSettings1).isEqualTo(tenantSettings2);

        tenantSettings2 = getTenantSettingsSample2();
        assertThat(tenantSettings1).isNotEqualTo(tenantSettings2);
    }

    @Test
    void tenantTest() {
        TenantSettings tenantSettings = getTenantSettingsRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        tenantSettings.setTenant(tenantBack);
        assertThat(tenantSettings.getTenant()).isEqualTo(tenantBack);

        tenantSettings.tenant(null);
        assertThat(tenantSettings.getTenant()).isNull();
    }
}
