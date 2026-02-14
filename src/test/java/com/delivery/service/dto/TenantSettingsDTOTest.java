package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TenantSettingsDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(TenantSettingsDTO.class);
        TenantSettingsDTO tenantSettingsDTO1 = new TenantSettingsDTO();
        tenantSettingsDTO1.setId(1L);
        TenantSettingsDTO tenantSettingsDTO2 = new TenantSettingsDTO();
        assertThat(tenantSettingsDTO1).isNotEqualTo(tenantSettingsDTO2);
        tenantSettingsDTO2.setId(tenantSettingsDTO1.getId());
        assertThat(tenantSettingsDTO1).isEqualTo(tenantSettingsDTO2);
        tenantSettingsDTO2.setId(2L);
        assertThat(tenantSettingsDTO1).isNotEqualTo(tenantSettingsDTO2);
        tenantSettingsDTO1.setId(null);
        assertThat(tenantSettingsDTO1).isNotEqualTo(tenantSettingsDTO2);
    }
}
