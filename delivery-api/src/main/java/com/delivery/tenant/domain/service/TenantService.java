package com.delivery.tenant.domain.service;

import com.delivery.shared.exception.DuplicateResourceException;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.tenant.domain.entity.Tenant;
import com.delivery.tenant.domain.entity.TenantSettings;
import com.delivery.tenant.domain.repository.TenantRepository;
import com.delivery.tenant.domain.repository.TenantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantSettingsRepository settingsRepository;
    private static final AtomicLong tenantCounter = new AtomicLong(1000);

    @Transactional
    public Tenant createTenant(String name, String email, String phone) {
        if (tenantRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Tenant", "email", email);
        }

        String code = generateTenantCode();

        Tenant tenant = Tenant.builder()
                .code(code)
                .name(name)
                .email(email)
                .phone(phone)
                .active(true)
                .build();

        tenant = tenantRepository.save(tenant);
        initializeDefaultSettings(tenant.getId());

        return tenant;
    }

    public Tenant getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));
    }

    public Tenant getActiveTenantById(UUID id) {
        return tenantRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));
    }

    @Transactional
    public Tenant updateTenant(UUID id, String name, String phone, String address, String logoUrl) {
        Tenant tenant = getTenantById(id);

        if (name != null) tenant.setName(name);
        if (phone != null) tenant.setPhone(phone);
        if (address != null) tenant.setAddress(address);
        if (logoUrl != null) tenant.setLogoUrl(logoUrl);

        return tenantRepository.save(tenant);
    }

    @Transactional
    public void deactivateTenant(UUID id) {
        Tenant tenant = getTenantById(id);
        tenant.setActive(false);
        tenantRepository.save(tenant);
    }

    @Transactional
    public void activateTenant(UUID id) {
        Tenant tenant = getTenantById(id);
        tenant.setActive(true);
        tenantRepository.save(tenant);
    }

    public Map<String, String> getSettings(UUID tenantId) {
        return settingsRepository.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(TenantSettings::getKey, TenantSettings::getValue));
    }

    public String getSetting(UUID tenantId, String key, String defaultValue) {
        return settingsRepository.findByTenantIdAndKey(tenantId, key)
                .map(TenantSettings::getValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void saveSetting(UUID tenantId, String key, String value) {
        TenantSettings settings = settingsRepository.findByTenantIdAndKey(tenantId, key)
                .orElse(TenantSettings.builder()
                        .tenantId(tenantId)
                        .key(key)
                        .build());

        settings.setValue(value);
        settingsRepository.save(settings);
    }

    @Transactional
    public void saveSettings(UUID tenantId, Map<String, String> settings) {
        settings.forEach((key, value) -> saveSetting(tenantId, key, value));
    }

    private String generateTenantCode() {
        return "TEN-" + String.format("%04d", tenantCounter.incrementAndGet());
    }

    private void initializeDefaultSettings(UUID tenantId) {
        Map<String, String> defaultSettings = Map.of(
                "currency", "FCFA",
                "date_format", "DD/MM/YYYY",
                "timezone", "Africa/Dakar",
                "credit_limit_warning", "80",
                "auto_round_generation", "true"
        );
        saveSettings(tenantId, defaultSettings);
    }
}
