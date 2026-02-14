package com.delivery;

import com.delivery.config.AsyncSyncConfiguration;
import com.delivery.config.EmbeddedSQL;
import com.delivery.config.JacksonConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = {
        DeliveryApp.class,
        JacksonConfiguration.class,
        AsyncSyncConfiguration.class,
        com.delivery.config.JacksonHibernateConfiguration.class,
    }
)
@EmbeddedSQL
public @interface IntegrationTest {}
