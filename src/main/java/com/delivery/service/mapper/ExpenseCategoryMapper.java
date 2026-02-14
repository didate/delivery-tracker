package com.delivery.service.mapper;

import com.delivery.domain.ExpenseCategory;
import com.delivery.domain.Tenant;
import com.delivery.service.dto.ExpenseCategoryDTO;
import com.delivery.service.dto.TenantDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ExpenseCategory} and its DTO {@link ExpenseCategoryDTO}.
 */
@Mapper(componentModel = "spring")
public interface ExpenseCategoryMapper extends EntityMapper<ExpenseCategoryDTO, ExpenseCategory> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    ExpenseCategoryDTO toDto(ExpenseCategory s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);
}
