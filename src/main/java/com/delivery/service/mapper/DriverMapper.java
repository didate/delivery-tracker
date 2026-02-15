package com.delivery.service.mapper;

import com.delivery.domain.Driver;
import com.delivery.domain.Vehicle;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.dto.VehicleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Driver} and its DTO {@link DriverDTO}.
 */
@Mapper(componentModel = "spring")
public interface DriverMapper extends EntityMapper<DriverDTO, Driver> {
    @Mapping(target = "vehicle", source = "vehicle", qualifiedByName = "vehicleId")
    DriverDTO toDto(Driver s);

    @Mapping(target = "tenant", ignore = true)
    Driver toEntity(DriverDTO driverDTO);

    @Named("vehicleId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    VehicleDTO toDtoVehicleId(Vehicle vehicle);
}
