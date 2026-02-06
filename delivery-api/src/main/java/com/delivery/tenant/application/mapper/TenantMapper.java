package com.delivery.tenant.application.mapper;

import com.delivery.tenant.application.dto.TenantResponse;
import com.delivery.tenant.domain.entity.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TenantMapper {

    @Mapping(target = "active", source = "active")
    TenantResponse toResponse(Tenant tenant);
}
