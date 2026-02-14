package com.delivery.service.mapper;

import com.delivery.domain.Tenant;
import com.delivery.domain.Vehicle;
import com.delivery.service.dto.TenantDTO;
import com.delivery.service.dto.VehicleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Vehicle} and its DTO {@link VehicleDTO}.
 */
@Mapper(componentModel = "spring")
public interface VehicleMapper extends EntityMapper<VehicleDTO, Vehicle> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    VehicleDTO toDto(Vehicle s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);
}
