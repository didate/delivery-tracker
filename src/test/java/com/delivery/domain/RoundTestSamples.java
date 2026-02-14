package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class RoundTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Round getRoundSample1() {
        return new Round().id(1L).name("name1");
    }

    public static Round getRoundSample2() {
        return new Round().id(2L).name("name2");
    }

    public static Round getRoundRandomSampleGenerator() {
        return new Round().id(longCount.incrementAndGet()).name(UUID.randomUUID().toString());
    }
}
