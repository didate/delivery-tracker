package com.delivery.customer.application.mapper;

import com.delivery.customer.application.dto.CustomerResponse;
import com.delivery.customer.domain.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "active", source = "active")
    @Mapping(target = "driverName", source = "driver.name")
    CustomerResponse toResponse(Customer customer);
}
