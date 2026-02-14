package com.delivery.service.mapper;

import com.delivery.domain.Customer;
import com.delivery.domain.Round;
import com.delivery.domain.RoundCustomer;
import com.delivery.service.dto.CustomerDTO;
import com.delivery.service.dto.RoundCustomerDTO;
import com.delivery.service.dto.RoundDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link RoundCustomer} and its DTO {@link RoundCustomerDTO}.
 */
@Mapper(componentModel = "spring")
public interface RoundCustomerMapper extends EntityMapper<RoundCustomerDTO, RoundCustomer> {
    @Mapping(target = "round", source = "round", qualifiedByName = "roundId")
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    RoundCustomerDTO toDto(RoundCustomer s);

    @Named("roundId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    RoundDTO toDtoRoundId(Round round);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);
}
