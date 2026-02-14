package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class TenantSettingsTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static TenantSettings getTenantSettingsSample1() {
        return new TenantSettings().id(1L).currency("currency1").timezone("timezone1").dateFormat("dateFormat1").language("language1");
    }

    public static TenantSettings getTenantSettingsSample2() {
        return new TenantSettings().id(2L).currency("currency2").timezone("timezone2").dateFormat("dateFormat2").language("language2");
    }

    public static TenantSettings getTenantSettingsRandomSampleGenerator() {
        return new TenantSettings()
            .id(longCount.incrementAndGet())
            .currency(UUID.randomUUID().toString())
            .timezone(UUID.randomUUID().toString())
            .dateFormat(UUID.randomUUID().toString())
            .language(UUID.randomUUID().toString());
    }
}
