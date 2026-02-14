package com.delivery.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ProductionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Production getProductionSample1() {
        return new Production().id(1L);
    }

    public static Production getProductionSample2() {
        return new Production().id(2L);
    }

    public static Production getProductionRandomSampleGenerator() {
        return new Production().id(longCount.incrementAndGet());
    }
}
