package com.delivery.service.mapper;

import com.delivery.domain.Driver;
import com.delivery.domain.Round;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.dto.RoundDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Round} and its DTO {@link RoundDTO}.
 */
@Mapper(componentModel = "spring")
public interface RoundMapper extends EntityMapper<RoundDTO, Round> {
    @Mapping(target = "driver", source = "driver", qualifiedByName = "driverId")
    RoundDTO toDto(Round s);

    @Mapping(target = "tenant", ignore = true)
    Round toEntity(RoundDTO roundDTO);

    @Named("driverId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DriverDTO toDtoDriverId(Driver driver);
}
