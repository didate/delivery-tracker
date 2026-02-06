package com.delivery.catalog.application.mapper;

import com.delivery.catalog.application.dto.PriceHistoryResponse;
import com.delivery.catalog.application.dto.ProductResponse;
import com.delivery.catalog.domain.entity.PriceHistory;
import com.delivery.catalog.domain.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "active", source = "active")
    ProductResponse toResponse(Product product);

    List<ProductResponse> toResponseList(List<Product> products);

    PriceHistoryResponse toPriceHistoryResponse(PriceHistory priceHistory);

    List<PriceHistoryResponse> toPriceHistoryResponseList(List<PriceHistory> priceHistories);
}
