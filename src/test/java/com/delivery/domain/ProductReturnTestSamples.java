package com.delivery.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ProductReturnTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static ProductReturn getProductReturnSample1() {
        return new ProductReturn().id(1L);
    }

    public static ProductReturn getProductReturnSample2() {
        return new ProductReturn().id(2L);
    }

    public static ProductReturn getProductReturnRandomSampleGenerator() {
        return new ProductReturn().id(longCount.incrementAndGet());
    }
}
