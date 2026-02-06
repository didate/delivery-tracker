package com.delivery.driver.application.mapper;

import com.delivery.driver.application.dto.ProductionSiteResponse;
import com.delivery.driver.domain.entity.ProductionSite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductionSiteMapper {

    @Mapping(target = "active", source = "active")
    ProductionSiteResponse toResponse(ProductionSite productionSite);
}
