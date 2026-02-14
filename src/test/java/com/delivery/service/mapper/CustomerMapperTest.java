package com.delivery.service.mapper;

import static com.delivery.domain.CustomerAsserts.*;
import static com.delivery.domain.CustomerTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CustomerMapperTest {

    private CustomerMapper customerMapper;

    @BeforeEach
    void setUp() {
        customerMapper = new CustomerMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCustomerSample1();
        var actual = customerMapper.toEntity(customerMapper.toDto(expected));
        assertCustomerAllPropertiesEquals(expected, actual);
    }
}
