package com.delivery.repository;

import com.delivery.domain.RoundCustomer;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the RoundCustomer entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RoundCustomerRepository extends JpaRepository<RoundCustomer, Long>, JpaSpecificationExecutor<RoundCustomer> {}
