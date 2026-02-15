package com.delivery.service.mapper;

import com.delivery.domain.Customer;
import com.delivery.domain.Delivery;
import com.delivery.domain.Driver;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.dto.DeliveryDTO;
import com.delivery.service.dto.DriverDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Delivery} and its DTO {@link DeliveryDTO}.
 */
@Mapper(componentModel = "spring")
public interface DeliveryMapper extends EntityMapper<DeliveryDTO, Delivery> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    @Mapping(target = "driver", source = "driver", qualifiedByName = "driverId")
    DeliveryDTO toDto(Delivery s);

    @Mapping(target = "tenant", ignore = true)
    Delivery toEntity(DeliveryDTO deliveryDTO);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);

    @Named("driverId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DriverDTO toDtoDriverId(Driver driver);
}
