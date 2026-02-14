package com.delivery.domain;

import static com.delivery.domain.PriceHistoryTestSamples.*;
import static com.delivery.domain.ProductTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PriceHistoryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PriceHistory.class);
        PriceHistory priceHistory1 = getPriceHistorySample1();
        PriceHistory priceHistory2 = new PriceHistory();
        assertThat(priceHistory1).isNotEqualTo(priceHistory2);

        priceHistory2.setId(priceHistory1.getId());
        assertThat(priceHistory1).isEqualTo(priceHistory2);

        priceHistory2 = getPriceHistorySample2();
        assertThat(priceHistory1).isNotEqualTo(priceHistory2);
    }

    @Test
    void productTest() {
        PriceHistory priceHistory = getPriceHistoryRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        priceHistory.setProduct(productBack);
        assertThat(priceHistory.getProduct()).isEqualTo(productBack);

        priceHistory.product(null);
        assertThat(priceHistory.getProduct()).isNull();
    }
}
