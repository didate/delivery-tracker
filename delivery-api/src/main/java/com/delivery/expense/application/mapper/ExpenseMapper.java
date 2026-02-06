package com.delivery.expense.application.mapper;

import com.delivery.expense.application.dto.ExpenseResponse;
import com.delivery.expense.domain.entity.Expense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {

    @Mapping(target = "driverName", source = "driver.name")
    @Mapping(target = "productionSiteName", source = "productionSite.name")
    ExpenseResponse toResponse(Expense expense);
}
