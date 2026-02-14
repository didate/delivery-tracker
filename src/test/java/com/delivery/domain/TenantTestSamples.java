package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class TenantTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Tenant getTenantSample1() {
        return new Tenant().id(1L).code("code1").name("name1").email("email1").phone("phone1").logoUrl("logoUrl1");
    }

    public static Tenant getTenantSample2() {
        return new Tenant().id(2L).code("code2").name("name2").email("email2").phone("phone2").logoUrl("logoUrl2");
    }

    public static Tenant getTenantRandomSampleGenerator() {
        return new Tenant()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .email(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString())
            .logoUrl(UUID.randomUUID().toString());
    }
}
