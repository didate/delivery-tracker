package com.delivery.service.mapper;

import com.delivery.domain.Product;
import com.delivery.domain.Tenant;
import com.delivery.service.dto.ProductDTO;
import com.delivery.service.dto.TenantDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Product} and its DTO {@link ProductDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper extends EntityMapper<ProductDTO, Product> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    ProductDTO toDto(Product s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);
}
