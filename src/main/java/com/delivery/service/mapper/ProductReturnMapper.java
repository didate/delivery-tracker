package com.delivery.service.mapper;

import com.delivery.domain.Customer;
import com.delivery.domain.Delivery;
import com.delivery.domain.ProductReturn;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.dto.ProductReturnDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ProductReturn} and its DTO
 * {@link ProductReturnDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProductReturnMapper extends EntityMapper<ProductReturnDTO, ProductReturn> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    @Mapping(target = "delivery", source = "delivery", qualifiedByName = "deliveryId")
    ProductReturnDTO toDto(ProductReturn s);

    @Mapping(target = "tenant", ignore = true)
    ProductReturn toEntity(ProductReturnDTO productReturnDTO);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);

    @Named("deliveryId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DeliveryDTO toDtoDeliveryId(Delivery delivery);
}
