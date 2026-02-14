package com.delivery.service.mapper;

import static com.delivery.domain.RoundAsserts.*;
import static com.delivery.domain.RoundTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RoundMapperTest {

    private RoundMapper roundMapper;

    @BeforeEach
    void setUp() {
        roundMapper = new RoundMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRoundSample1();
        var actual = roundMapper.toEntity(roundMapper.toDto(expected));
        assertRoundAllPropertiesEquals(expected, actual);
    }
}
