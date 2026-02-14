package com.delivery.service.mapper;

import static com.delivery.domain.ProductReturnAsserts.*;
import static com.delivery.domain.ProductReturnTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProductReturnMapperTest {

    private ProductReturnMapper productReturnMapper;

    @BeforeEach
    void setUp() {
        productReturnMapper = new ProductReturnMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getProductReturnSample1();
        var actual = productReturnMapper.toEntity(productReturnMapper.toDto(expected));
        assertProductReturnAllPropertiesEquals(expected, actual);
    }
}
