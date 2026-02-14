package com.delivery.service.mapper;

import static com.delivery.domain.PriceHistoryAsserts.*;
import static com.delivery.domain.PriceHistoryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PriceHistoryMapperTest {

    private PriceHistoryMapper priceHistoryMapper;

    @BeforeEach
    void setUp() {
        priceHistoryMapper = new PriceHistoryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPriceHistorySample1();
        var actual = priceHistoryMapper.toEntity(priceHistoryMapper.toDto(expected));
        assertPriceHistoryAllPropertiesEquals(expected, actual);
    }
}
