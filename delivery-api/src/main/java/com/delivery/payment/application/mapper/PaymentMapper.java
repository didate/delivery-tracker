package com.delivery.payment.application.mapper;

import com.delivery.payment.application.dto.PaymentResponse;
import com.delivery.payment.domain.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "driverName", source = "driver.name")
    PaymentResponse toResponse(Payment payment);
}
