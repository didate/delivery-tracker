package com.delivery.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class DeliveryItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static DeliveryItem getDeliveryItemSample1() {
        return new DeliveryItem().id(1L);
    }

    public static DeliveryItem getDeliveryItemSample2() {
        return new DeliveryItem().id(2L);
    }

    public static DeliveryItem getDeliveryItemRandomSampleGenerator() {
        return new DeliveryItem().id(longCount.incrementAndGet());
    }
}
