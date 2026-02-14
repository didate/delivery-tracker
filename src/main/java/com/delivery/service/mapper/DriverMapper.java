package com.delivery.service.mapper;

import com.delivery.domain.Driver;
import com.delivery.domain.Tenant;
import com.delivery.domain.Vehicle;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.dto.TenantDTO;
import com.delivery.service.dto.VehicleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Driver} and its DTO {@link DriverDTO}.
 */
@Mapper(componentModel = "spring")
public interface DriverMapper extends EntityMapper<DriverDTO, Driver> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    @Mapping(target = "vehicle", source = "vehicle", qualifiedByName = "vehicleId")
    DriverDTO toDto(Driver s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);

    @Named("vehicleId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    VehicleDTO toDtoVehicleId(Vehicle vehicle);
}
