package com.delivery.service.mapper;

import com.delivery.domain.Product;
import com.delivery.domain.Production;
import com.delivery.domain.ProductionSite;
import com.delivery.service.dto.ProductDTO;
import com.delivery.service.dto.ProductionDTO;
import com.delivery.service.dto.ProductionSiteDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Production} and its DTO {@link ProductionDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductionMapper extends EntityMapper<ProductionDTO, Production> {
    @Mapping(target = "product", source = "product", qualifiedByName = "productId")
    @Mapping(target = "productionSite", source = "productionSite", qualifiedByName = "productionSiteId")
    ProductionDTO toDto(Production s);

    @Mapping(target = "tenant", ignore = true)
    Production toEntity(ProductionDTO productionDTO);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);

    @Named("productionSiteId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductionSiteDTO toDtoProductionSiteId(ProductionSite productionSite);
}
