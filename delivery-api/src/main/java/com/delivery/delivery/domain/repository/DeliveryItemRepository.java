package com.delivery.delivery.domain.repository;

import com.delivery.delivery.domain.entity.DeliveryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryItemRepository extends JpaRepository<DeliveryItem, UUID> {

    List<DeliveryItem> findByDeliveryId(UUID deliveryId);

    Optional<DeliveryItem> findByIdAndDeliveryId(UUID id, UUID deliveryId);

    void deleteByDeliveryId(UUID deliveryId);
}
