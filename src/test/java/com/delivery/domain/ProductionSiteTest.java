package com.delivery.domain;

import static com.delivery.domain.ProductionSiteTestSamples.*;
import static com.delivery.domain.TenantTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductionSiteTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProductionSite.class);
        ProductionSite productionSite1 = getProductionSiteSample1();
        ProductionSite productionSite2 = new ProductionSite();
        assertThat(productionSite1).isNotEqualTo(productionSite2);

        productionSite2.setId(productionSite1.getId());
        assertThat(productionSite1).isEqualTo(productionSite2);

        productionSite2 = getProductionSiteSample2();
        assertThat(productionSite1).isNotEqualTo(productionSite2);
    }

    @Test
    void tenantTest() {
        ProductionSite productionSite = getProductionSiteRandomSampleGenerator();
        Tenant tenantBack = getTenantRandomSampleGenerator();

        productionSite.setTenant(tenantBack);
        assertThat(productionSite.getTenant()).isEqualTo(tenantBack);

        productionSite.tenant(null);
        assertThat(productionSite.getTenant()).isNull();
    }
}
