package com.delivery.service.mapper;

import static com.delivery.domain.DeliveryItemAsserts.*;
import static com.delivery.domain.DeliveryItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DeliveryItemMapperTest {

    private DeliveryItemMapper deliveryItemMapper;

    @BeforeEach
    void setUp() {
        deliveryItemMapper = new DeliveryItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDeliveryItemSample1();
        var actual = deliveryItemMapper.toEntity(deliveryItemMapper.toDto(expected));
        assertDeliveryItemAllPropertiesEquals(expected, actual);
    }
}
