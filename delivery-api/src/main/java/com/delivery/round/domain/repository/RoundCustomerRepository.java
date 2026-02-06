package com.delivery.round.domain.repository;

import com.delivery.round.domain.entity.RoundCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoundCustomerRepository extends JpaRepository<RoundCustomer, UUID> {

    List<RoundCustomer> findByRoundIdOrderBySequenceOrder(UUID roundId);

    Optional<RoundCustomer> findByRoundIdAndCustomerId(UUID roundId, UUID customerId);

    long countByRoundId(UUID roundId);

    long countByRoundIdAndVisited(UUID roundId, boolean visited);

    void deleteByRoundIdAndCustomerId(UUID roundId, UUID customerId);

    boolean existsByRoundIdAndCustomerId(UUID roundId, UUID customerId);
}
