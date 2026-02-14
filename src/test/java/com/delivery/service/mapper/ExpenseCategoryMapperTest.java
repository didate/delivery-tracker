package com.delivery.service.mapper;

import static com.delivery.domain.ExpenseCategoryAsserts.*;
import static com.delivery.domain.ExpenseCategoryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ExpenseCategoryMapperTest {

    private ExpenseCategoryMapper expenseCategoryMapper;

    @BeforeEach
    void setUp() {
        expenseCategoryMapper = new ExpenseCategoryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getExpenseCategorySample1();
        var actual = expenseCategoryMapper.toEntity(expenseCategoryMapper.toDto(expected));
        assertExpenseCategoryAllPropertiesEquals(expected, actual);
    }
}
