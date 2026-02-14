package com.delivery.domain;

import static com.delivery.domain.ProductReturnTestSamples.*;
import static com.delivery.domain.ProductTestSamples.*;
import static com.delivery.domain.ReturnItemTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReturnItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ReturnItem.class);
        ReturnItem returnItem1 = getReturnItemSample1();
        ReturnItem returnItem2 = new ReturnItem();
        assertThat(returnItem1).isNotEqualTo(returnItem2);

        returnItem2.setId(returnItem1.getId());
        assertThat(returnItem1).isEqualTo(returnItem2);

        returnItem2 = getReturnItemSample2();
        assertThat(returnItem1).isNotEqualTo(returnItem2);
    }

    @Test
    void productReturnTest() {
        ReturnItem returnItem = getReturnItemRandomSampleGenerator();
        ProductReturn productReturnBack = getProductReturnRandomSampleGenerator();

        returnItem.setProductReturn(productReturnBack);
        assertThat(returnItem.getProductReturn()).isEqualTo(productReturnBack);

        returnItem.productReturn(null);
        assertThat(returnItem.getProductReturn()).isNull();
    }

    @Test
    void productTest() {
        ReturnItem returnItem = getReturnItemRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        returnItem.setProduct(productBack);
        assertThat(returnItem.getProduct()).isEqualTo(productBack);

        returnItem.product(null);
        assertThat(returnItem.getProduct()).isNull();
    }
}
