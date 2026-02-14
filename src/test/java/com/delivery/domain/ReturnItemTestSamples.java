package com.delivery.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ReturnItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static ReturnItem getReturnItemSample1() {
        return new ReturnItem().id(1L);
    }

    public static ReturnItem getReturnItemSample2() {
        return new ReturnItem().id(2L);
    }

    public static ReturnItem getReturnItemRandomSampleGenerator() {
        return new ReturnItem().id(longCount.incrementAndGet());
    }
}
