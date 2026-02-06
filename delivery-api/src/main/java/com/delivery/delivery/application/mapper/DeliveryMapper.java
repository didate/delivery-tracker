package com.delivery.delivery.application.mapper;

import com.delivery.delivery.application.dto.DeliveryItemResponse;
import com.delivery.delivery.application.dto.DeliveryResponse;
import com.delivery.delivery.domain.entity.Delivery;
import com.delivery.delivery.domain.entity.DeliveryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DeliveryMapper {

    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "customerCode", source = "customer.code")
    @Mapping(target = "driverName", source = "driver.name")
    @Mapping(target = "items", source = "items")
    DeliveryResponse toResponse(Delivery delivery);

    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productCode", source = "product.code")
    DeliveryItemResponse toItemResponse(DeliveryItem deliveryItem);

    List<DeliveryItemResponse> toItemResponseList(List<DeliveryItem> items);
}
