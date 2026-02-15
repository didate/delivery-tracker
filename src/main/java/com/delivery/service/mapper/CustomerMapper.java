package com.delivery.service.mapper;

import com.delivery.domain.Customer;
import com.delivery.domain.Driver;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.dto.DriverDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Customer} and its DTO {@link CustomerDTO}.
 */
@Mapper(componentModel = "spring")
public interface CustomerMapper extends EntityMapper<CustomerDTO, Customer> {
    @Mapping(target = "driver", source = "driver", qualifiedByName = "driverId")
    CustomerDTO toDto(Customer s);

    @Mapping(target = "tenant", ignore = true)
    Customer toEntity(CustomerDTO customerDTO);

    @Named("driverId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DriverDTO toDtoDriverId(Driver driver);
}
