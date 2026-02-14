package com.delivery.service.mapper;

import static com.delivery.domain.DeliveryAsserts.*;
import static com.delivery.domain.DeliveryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DeliveryMapperTest {

    private DeliveryMapper deliveryMapper;

    @BeforeEach
    void setUp() {
        deliveryMapper = new DeliveryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDeliverySample1();
        var actual = deliveryMapper.toEntity(deliveryMapper.toDto(expected));
        assertDeliveryAllPropertiesEquals(expected, actual);
    }
}
