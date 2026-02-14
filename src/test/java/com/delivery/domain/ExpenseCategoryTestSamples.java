package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ExpenseCategoryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static ExpenseCategory getExpenseCategorySample1() {
        return new ExpenseCategory().id(1L).code("code1").name("name1");
    }

    public static ExpenseCategory getExpenseCategorySample2() {
        return new ExpenseCategory().id(2L).code("code2").name("name2");
    }

    public static ExpenseCategory getExpenseCategoryRandomSampleGenerator() {
        return new ExpenseCategory().id(longCount.incrementAndGet()).code(UUID.randomUUID().toString()).name(UUID.randomUUID().toString());
    }
}
