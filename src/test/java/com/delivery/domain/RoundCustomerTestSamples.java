package com.delivery.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class RoundCustomerTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static RoundCustomer getRoundCustomerSample1() {
        return new RoundCustomer().id(1L).sequenceOrder(1);
    }

    public static RoundCustomer getRoundCustomerSample2() {
        return new RoundCustomer().id(2L).sequenceOrder(2);
    }

    public static RoundCustomer getRoundCustomerRandomSampleGenerator() {
        return new RoundCustomer().id(longCount.incrementAndGet()).sequenceOrder(intCount.incrementAndGet());
    }
}
