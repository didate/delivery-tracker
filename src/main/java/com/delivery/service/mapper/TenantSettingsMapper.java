package com.delivery.service.mapper;

import com.delivery.domain.Tenant;
import com.delivery.domain.TenantSettings;
import com.delivery.service.dto.TenantDTO;
import com.delivery.service.dto.TenantSettingsDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link TenantSettings} and its DTO {@link TenantSettingsDTO}.
 */
@Mapper(componentModel = "spring")
public interface TenantSettingsMapper extends EntityMapper<TenantSettingsDTO, TenantSettings> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    TenantSettingsDTO toDto(TenantSettings s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);
}
