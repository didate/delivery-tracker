package com.delivery.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class PriceHistoryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static PriceHistory getPriceHistorySample1() {
        return new PriceHistory().id(1L);
    }

    public static PriceHistory getPriceHistorySample2() {
        return new PriceHistory().id(2L);
    }

    public static PriceHistory getPriceHistoryRandomSampleGenerator() {
        return new PriceHistory().id(longCount.incrementAndGet());
    }
}
