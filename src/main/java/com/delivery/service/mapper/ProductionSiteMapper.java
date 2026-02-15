package com.delivery.service.mapper;

import com.delivery.domain.ProductionSite;
import com.delivery.service.dto.ProductionSiteDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ProductionSite} and its DTO
 * {@link ProductionSiteDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductionSiteMapper extends EntityMapper<ProductionSiteDTO, ProductionSite> {
    ProductionSiteDTO toDto(ProductionSite s);

    @Mapping(target = "tenant", ignore = true)
    ProductionSite toEntity(ProductionSiteDTO productionSiteDTO);
}
