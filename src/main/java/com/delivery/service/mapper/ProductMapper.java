package com.delivery.service.mapper;

import com.delivery.domain.Product;
import com.delivery.service.dto.ProductDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Product} and its DTO {@link ProductDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper extends EntityMapper<ProductDTO, Product> {
    ProductDTO toDto(Product s);

    @Mapping(target = "tenant", ignore = true)
    Product toEntity(ProductDTO productDTO);
}
