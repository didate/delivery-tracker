package com.delivery.domain;

import static com.delivery.domain.ProductTestSamples.*;
import static com.delivery.domain.ProductionSiteTestSamples.*;
import static com.delivery.domain.ProductionTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Production.class);
        Production production1 = getProductionSample1();
        Production production2 = new Production();
        assertThat(production1).isNotEqualTo(production2);

        production2.setId(production1.getId());
        assertThat(production1).isEqualTo(production2);

        production2 = getProductionSample2();
        assertThat(production1).isNotEqualTo(production2);
    }

    @Test
    void tenantTest() {
        Production production = getProductionRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        production.setTenant(tenantBack);
        assertThat(production.getTenant()).isEqualTo(tenantBack);

        production.tenant(null);
        assertThat(production.getTenant()).isNull();
    }

    @Test
    void productTest() {
        Production production = getProductionRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        production.setProduct(productBack);
        assertThat(production.getProduct()).isEqualTo(productBack);

        production.product(null);
        assertThat(production.getProduct()).isNull();
    }

    @Test
    void productionSiteTest() {
        Production production = getProductionRandomSampleGenerator();
        ProductionSite productionSiteBack = getProductionSiteRandomSampleGenerator();

        production.setProductionSite(productionSiteBack);
        assertThat(production.getProductionSite()).isEqualTo(productionSiteBack);

        production.productionSite(null);
        assertThat(production.getProductionSite()).isNull();
    }
}
