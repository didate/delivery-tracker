package com.delivery.service.mapper;

import com.delivery.domain.ProductionSite;
import com.delivery.domain.Tenant;
import com.delivery.service.dto.ProductionSiteDTO;
import com.delivery.service.dto.TenantDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ProductionSite} and its DTO {@link ProductionSiteDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductionSiteMapper extends EntityMapper<ProductionSiteDTO, ProductionSite> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    ProductionSiteDTO toDto(ProductionSite s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);
}
