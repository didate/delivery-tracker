package com.delivery.service.mapper;

import static com.delivery.domain.ProductionSiteAsserts.*;
import static com.delivery.domain.ProductionSiteTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProductionSiteMapperTest {

    private ProductionSiteMapper productionSiteMapper;

    @BeforeEach
    void setUp() {
        productionSiteMapper = new ProductionSiteMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getProductionSiteSample1();
        var actual = productionSiteMapper.toEntity(productionSiteMapper.toDto(expected));
        assertProductionSiteAllPropertiesEquals(expected, actual);
    }
}
