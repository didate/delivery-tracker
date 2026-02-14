package com.delivery.config;

import java.time.Duration;
import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;
import org.hibernate.cache.jcache.ConfigSettings;
import org.springframework.boot.cache.autoconfigure.JCacheManagerCustomizer;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        var ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(
                Object.class,
                Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries())
            )
                .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                .build()
        );
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, com.delivery.repository.UserRepository.USERS_BY_LOGIN_CACHE);
            createCache(cm, com.delivery.repository.UserRepository.USERS_BY_EMAIL_CACHE);
            createCache(cm, com.delivery.domain.User.class.getName());
            createCache(cm, com.delivery.domain.Authority.class.getName());
            createCache(cm, com.delivery.domain.User.class.getName() + ".authorities");
            createCache(cm, com.delivery.domain.Tenant.class.getName());
            createCache(cm, com.delivery.domain.TenantSettings.class.getName());
            createCache(cm, com.delivery.domain.Product.class.getName());
            createCache(cm, com.delivery.domain.PriceHistory.class.getName());
            createCache(cm, com.delivery.domain.Vehicle.class.getName());
            createCache(cm, com.delivery.domain.Driver.class.getName());
            createCache(cm, com.delivery.domain.ProductionSite.class.getName());
            createCache(cm, com.delivery.domain.Customer.class.getName());
            createCache(cm, com.delivery.domain.Production.class.getName());
            createCache(cm, com.delivery.domain.Delivery.class.getName());
            createCache(cm, com.delivery.domain.DeliveryItem.class.getName());
            createCache(cm, com.delivery.domain.Round.class.getName());
            createCache(cm, com.delivery.domain.RoundCustomer.class.getName());
            createCache(cm, com.delivery.domain.Payment.class.getName());
            createCache(cm, com.delivery.domain.ProductReturn.class.getName());
            createCache(cm, com.delivery.domain.ReturnItem.class.getName());
            createCache(cm, com.delivery.domain.ExpenseCategory.class.getName());
            createCache(cm, com.delivery.domain.Expense.class.getName());
            // jhipster-needle-ehcache-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        } else {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }
}
