package com.delivery.service.mapper;

import com.delivery.domain.Customer;
import com.delivery.domain.Delivery;
import com.delivery.domain.Payment;
import com.delivery.domain.Tenant;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.dto.PaymentDTO;
import com.delivery.service.dto.TenantDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Payment} and its DTO {@link PaymentDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaymentMapper extends EntityMapper<PaymentDTO, Payment> {
    @Mapping(target = "tenant", source = "tenant", qualifiedByName = "tenantId")
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    @Mapping(target = "delivery", source = "delivery", qualifiedByName = "deliveryId")
    PaymentDTO toDto(Payment s);

    @Named("tenantId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    TenantDTO toDtoTenantId(Tenant tenant);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);

    @Named("deliveryId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DeliveryDTO toDtoDeliveryId(Delivery delivery);
}
