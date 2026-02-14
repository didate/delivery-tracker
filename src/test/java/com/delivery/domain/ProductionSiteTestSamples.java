package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ProductionSiteTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static ProductionSite getProductionSiteSample1() {
        return new ProductionSite().id(1L).code("code1").name("name1").phone("phone1");
    }

    public static ProductionSite getProductionSiteSample2() {
        return new ProductionSite().id(2L).code("code2").name("name2").phone("phone2");
    }

    public static ProductionSite getProductionSiteRandomSampleGenerator() {
        return new ProductionSite()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString());
    }
}
