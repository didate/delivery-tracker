package com.delivery.tenant.domain.entity;

import com.delivery.shared.domain.AbstractAuditingEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant extends AbstractAuditingEntity<UUID> {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Override
    public UUID getId() {
        return id;
    }
}
