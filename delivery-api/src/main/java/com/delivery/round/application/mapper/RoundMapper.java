package com.delivery.round.application.mapper;

import com.delivery.round.application.dto.RoundCustomerResponse;
import com.delivery.round.application.dto.RoundResponse;
import com.delivery.round.domain.entity.Round;
import com.delivery.round.domain.entity.RoundCustomer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoundMapper {

    @Mapping(target = "driverName", source = "driver.name")
    @Mapping(target = "customers", source = "roundCustomers")
    RoundResponse toResponse(Round round);

    @Mapping(target = "driverName", source = "driver.name")
    @Mapping(target = "customers", ignore = true)
    RoundResponse toResponseWithoutCustomers(Round round);

    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "customerCode", source = "customer.code")
    @Mapping(target = "customerAddress", source = "customer.address")
    @Mapping(target = "customerPhone", source = "customer.phone")
    RoundCustomerResponse toRoundCustomerResponse(RoundCustomer roundCustomer);

    List<RoundCustomerResponse> toRoundCustomerResponseList(List<RoundCustomer> roundCustomers);
}
