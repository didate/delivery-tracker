package com.delivery.driver.application.mapper;

import com.delivery.driver.application.dto.DriverResponse;
import com.delivery.driver.domain.entity.Driver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DriverMapper {

    @Mapping(target = "active", source = "active")
    @Mapping(target = "productionSiteName", source = "productionSite.name")
    DriverResponse toResponse(Driver driver);
}
