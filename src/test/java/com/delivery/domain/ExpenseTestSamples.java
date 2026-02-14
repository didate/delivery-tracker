package com.delivery.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ExpenseTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Expense getExpenseSample1() {
        return new Expense().id(1L).receiptUrl("receiptUrl1");
    }

    public static Expense getExpenseSample2() {
        return new Expense().id(2L).receiptUrl("receiptUrl2");
    }

    public static Expense getExpenseRandomSampleGenerator() {
        return new Expense().id(longCount.incrementAndGet()).receiptUrl(UUID.randomUUID().toString());
    }
}
