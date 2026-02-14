package com.delivery.service.mapper;

import static com.delivery.domain.ReturnItemAsserts.*;
import static com.delivery.domain.ReturnItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReturnItemMapperTest {

    private ReturnItemMapper returnItemMapper;

    @BeforeEach
    void setUp() {
        returnItemMapper = new ReturnItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getReturnItemSample1();
        var actual = returnItemMapper.toEntity(returnItemMapper.toDto(expected));
        assertReturnItemAllPropertiesEquals(expected, actual);
    }
}
