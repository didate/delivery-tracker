package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class VehicleTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Vehicle getVehicleSample1() {
        return new Vehicle()
            .id(1L)
            .code("code1")
            .name("name1")
            .brand("brand1")
            .model("model1")
            .registrationNumber("registrationNumber1")
            .year(1)
            .fuelType("fuelType1");
    }

    public static Vehicle getVehicleSample2() {
        return new Vehicle()
            .id(2L)
            .code("code2")
            .name("name2")
            .brand("brand2")
            .model("model2")
            .registrationNumber("registrationNumber2")
            .year(2)
            .fuelType("fuelType2");
    }

    public static Vehicle getVehicleRandomSampleGenerator() {
        return new Vehicle()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .brand(UUID.randomUUID().toString())
            .model(UUID.randomUUID().toString())
            .registrationNumber(UUID.randomUUID().toString())
            .year(intCount.incrementAndGet())
            .fuelType(UUID.randomUUID().toString());
    }
}
