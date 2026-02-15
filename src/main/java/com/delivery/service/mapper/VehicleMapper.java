package com.delivery.service.mapper;

import com.delivery.domain.Vehicle;
import com.delivery.service.dto.VehicleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Vehicle} and its DTO {@link VehicleDTO}.
 */
@Mapper(componentModel = "spring")
public interface VehicleMapper extends EntityMapper<VehicleDTO, Vehicle> {
    VehicleDTO toDto(Vehicle s);

    @Mapping(target = "tenant", ignore = true)
    Vehicle toEntity(VehicleDTO vehicleDTO);
}
