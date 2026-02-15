package com.delivery.service.mapper;

import com.delivery.domain.Delivery;
import com.delivery.domain.DeliveryItem;
import com.delivery.domain.Product;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.dto.DeliveryItemDTO;
import com.delivery.service.dto.ProductDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link DeliveryItem} and its DTO
 * {@link DeliveryItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface DeliveryItemMapper extends EntityMapper<DeliveryItemDTO, DeliveryItem> {
    @Mapping(target = "delivery", source = "delivery", qualifiedByName = "deliveryId")
    @Mapping(target = "product", source = "product", qualifiedByName = "productId")
    DeliveryItemDTO toDto(DeliveryItem s);

    @Named("deliveryId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DeliveryDTO toDtoDeliveryId(Delivery delivery);

    @Named("productId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProductDTO toDtoProductId(Product product);
}
