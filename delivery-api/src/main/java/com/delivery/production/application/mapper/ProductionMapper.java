package com.delivery.production.application.mapper;

import com.delivery.production.application.dto.ProductionResponse;
import com.delivery.production.application.dto.ProductionSummaryResponse;
import com.delivery.production.domain.entity.Production;
import com.delivery.production.domain.service.ProductionService;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductionMapper {

    ProductionResponse toResponse(Production production);

    default ProductionSummaryResponse toSummaryResponse(ProductionService.ProductionSummary summary) {
        return ProductionSummaryResponse.builder()
                .productId(summary.productId())
                .productName(summary.productName())
                .totalQuantity(summary.totalQuantity())
                .build();
    }
}
