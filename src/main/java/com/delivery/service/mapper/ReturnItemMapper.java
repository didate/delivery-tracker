package com.delivery.service.mapper;

import com.delivery.domain.Product;
import com.delivery.domain.ProductReturn;
import com.delivery.domain.ReturnItem;
import com.delivery.service.dto.ProductDTO;
import com.delivery.service.dto.ProductReturnDTO;
import com.delivery.service.dto.ReturnItemDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ReturnItem} and its DTO {@link ReturnItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface ReturnItemMapper extends EntityMapper<ReturnItemDTO, ReturnItem> {
    @Mapping(target = "productReturn", source = "productReturn", qualifiedByName = "productReturnId")
    @Mapping(target = "product", source = "product", qualifiedByName = "productId")
    ReturnItemDTO toDto(ReturnItem s);

    @Mapping(target = "tenant", ignore = true)
    ReturnItem toEntity(ReturnItemDTO returnItemDTO);

    @Named("productReturnId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductReturnDTO toDtoProductReturnId(ProductReturn productReturn);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);
}
