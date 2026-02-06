package com.delivery.returns.domain.repository;

import com.delivery.returns.domain.entity.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, UUID> {

    List<ReturnItem> findByReturnId(UUID returnId);

    Optional<ReturnItem> findByIdAndReturnId(UUID id, UUID returnId);

    void deleteByReturnId(UUID returnId);

    Optional<ReturnItem> findByIdAndTenantId(UUID id, UUID tenantId);
}
