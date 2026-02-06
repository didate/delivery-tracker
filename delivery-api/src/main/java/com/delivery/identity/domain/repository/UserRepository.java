package com.delivery.identity.domain.repository;

import com.delivery.identity.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByTenantIdAndEmail(UUID tenantId, String email);

    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);

    Page<User> findAllByTenantId(UUID tenantId, Pageable pageable);

    boolean existsByTenantIdAndEmail(UUID tenantId, String email);

    Optional<User> findByEmail(String email);
}
