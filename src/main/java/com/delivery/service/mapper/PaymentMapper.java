package com.delivery.service.mapper;

import com.delivery.domain.Customer;
import com.delivery.domain.Delivery;
import com.delivery.domain.Payment;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.dto.PaymentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Payment} and its DTO {@link PaymentDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaymentMapper extends EntityMapper<PaymentDTO, Payment> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    @Mapping(target = "delivery", source = "delivery", qualifiedByName = "deliveryId")
    PaymentDTO toDto(Payment s);

    @Mapping(target = "tenant", ignore = true)
    Payment toEntity(PaymentDTO paymentDTO);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);

    @Named("deliveryId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DeliveryDTO toDtoDeliveryId(Delivery delivery);
}
