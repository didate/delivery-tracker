package com.delivery.service.mapper;

import static com.delivery.domain.RoundCustomerAsserts.*;
import static com.delivery.domain.RoundCustomerTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RoundCustomerMapperTest {

    private RoundCustomerMapper roundCustomerMapper;

    @BeforeEach
    void setUp() {
        roundCustomerMapper = new RoundCustomerMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRoundCustomerSample1();
        var actual = roundCustomerMapper.toEntity(roundCustomerMapper.toDto(expected));
        assertRoundCustomerAllPropertiesEquals(expected, actual);
    }
}
