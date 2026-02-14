package com.delivery.service.mapper;

import static com.delivery.domain.ProductionAsserts.*;
import static com.delivery.domain.ProductionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProductionMapperTest {

    private ProductionMapper productionMapper;

    @BeforeEach
    void setUp() {
        productionMapper = new ProductionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getProductionSample1();
        var actual = productionMapper.toEntity(productionMapper.toDto(expected));
        assertProductionAllPropertiesEquals(expected, actual);
    }
}
