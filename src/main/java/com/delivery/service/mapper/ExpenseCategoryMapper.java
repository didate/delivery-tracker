package com.delivery.service.mapper;

import com.delivery.domain.ExpenseCategory;
import com.delivery.service.dto.ExpenseCategoryDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ExpenseCategory} and its DTO
 * {@link ExpenseCategoryDTO}.
 */
@Mapper(componentModel = "spring")
public interface ExpenseCategoryMapper extends EntityMapper<ExpenseCategoryDTO, ExpenseCategory> {
    ExpenseCategoryDTO toDto(ExpenseCategory s);

    @Mapping(target = "tenant", ignore = true)
    ExpenseCategory toEntity(ExpenseCategoryDTO expenseCategoryDTO);
}
