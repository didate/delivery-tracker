package com.delivery.service.mapper;

import com.delivery.domain.TenantSettings;
import com.delivery.service.dto.TenantSettingsDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link TenantSettings} and its DTO
 * {@link TenantSettingsDTO}.
 */
@Mapper(componentModel = "spring")
public interface TenantSettingsMapper extends EntityMapper<TenantSettingsDTO, TenantSettings> {
    TenantSettingsDTO toDto(TenantSettings s);

    @Mapping(target = "tenant", ignore = true)
    TenantSettings toEntity(TenantSettingsDTO tenantSettingsDTO);
}
