package com.delivery.service.mapper;

import static com.delivery.domain.TenantSettingsAsserts.*;
import static com.delivery.domain.TenantSettingsTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TenantSettingsMapperTest {

    private TenantSettingsMapper tenantSettingsMapper;

    @BeforeEach
    void setUp() {
        tenantSettingsMapper = new TenantSettingsMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getTenantSettingsSample1();
        var actual = tenantSettingsMapper.toEntity(tenantSettingsMapper.toDto(expected));
        assertTenantSettingsAllPropertiesEquals(expected, actual);
    }
}
