package com.delivery.service.mapper;

import com.delivery.domain.PriceHistory;
import com.delivery.domain.Product;
import com.delivery.service.dto.PriceHistoryDTO;
import com.delivery.service.dto.ProductDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link PriceHistory} and its DTO
 * {@link PriceHistoryDTO}.
 */
@Mapper(componentModel = "spring")
public interface PriceHistoryMapper extends EntityMapper<PriceHistoryDTO, PriceHistory> {
    @Mapping(target = "product", source = "product", qualifiedByName = "productId")
    PriceHistoryDTO toDto(PriceHistory s);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);
}
