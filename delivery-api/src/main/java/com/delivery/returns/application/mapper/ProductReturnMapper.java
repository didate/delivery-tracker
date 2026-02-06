package com.delivery.returns.application.mapper;

import com.delivery.returns.application.dto.CreateReturnItemRequest;
import com.delivery.returns.application.dto.ReturnItemResponse;
import com.delivery.returns.application.dto.ReturnResponse;
import com.delivery.returns.domain.entity.ProductReturn;
import com.delivery.returns.domain.entity.ReturnItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductReturnMapper {

    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "customerCode", source = "customer.code")
    @Mapping(target = "driverName", source = "driver.name")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "totalItems", expression = "java(productReturn.getItems() != null ? productReturn.getItems().size() : 0)")
    @Mapping(target = "totalQuantity", expression = "java(calculateTotalQuantity(productReturn))")
    ReturnResponse toResponse(ProductReturn productReturn);

    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "totalValue", expression = "java(calculateTotalValue(returnItem))")
    ReturnItemResponse toItemResponse(ReturnItem returnItem);

    List<ReturnItemResponse> toItemResponseList(List<ReturnItem> returnItems);

    default ReturnItem toEntity(CreateReturnItemRequest request) {
        if (request == null) {
            return null;
        }
        ReturnItem item = new ReturnItem();
        item.setProductId(request.getProductId());
        item.setQuantity(request.getQuantity());
        item.setReason(request.getReason());
        item.setUnitValue(request.getUnitValue());
        return item;
    }

    default List<ReturnItem> toEntityList(List<CreateReturnItemRequest> requests) {
        if (requests == null) {
            return null;
        }
        return requests.stream().map(this::toEntity).toList();
    }

    default Integer calculateTotalQuantity(ProductReturn productReturn) {
        if (productReturn.getItems() == null || productReturn.getItems().isEmpty()) {
            return 0;
        }
        return productReturn.getItems().stream()
                .mapToInt(ReturnItem::getQuantity)
                .sum();
    }

    default BigDecimal calculateTotalValue(ReturnItem returnItem) {
        if (returnItem.getUnitValue() == null) {
            return null;
        }
        return returnItem.getUnitValue().multiply(BigDecimal.valueOf(returnItem.getQuantity()));
    }
}
