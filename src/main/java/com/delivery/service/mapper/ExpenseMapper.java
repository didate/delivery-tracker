package com.delivery.service.mapper;

import com.delivery.domain.Driver;
import com.delivery.domain.Expense;
import com.delivery.domain.ExpenseCategory;
import com.delivery.domain.Tenant;
import com.delivery.service.dto.DriverDTO;
import com.delivery.service.dto.ExpenseCategoryDTO;
import com.delivery.service.dto.ExpenseDTO;
import com.delivery.service.dto.TenantDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Expense} and its DTO {@link ExpenseDTO}.
 */
@Mapper(componentModel = "spring")
public interface ExpenseMapper extends EntityMapper<ExpenseDTO, Expense> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    @Mapping(target = "category", source = "category", qualifiedByName = "expenseCategoryId")
    @Mapping(target = "driver", source = "driver", qualifiedByName = "driverId")
    ExpenseDTO toDto(Expense s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);

    @Named("expenseCategoryId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ExpenseCategoryDTO toDtoExpenseCategoryId(ExpenseCategory expenseCategory);

    @Named("driverId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DriverDTO toDtoDriverId(Driver driver);
}
