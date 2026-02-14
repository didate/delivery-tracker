package com.delivery.domain;

import static com.delivery.domain.DeliveryItemTestSamples.*;
import static com.delivery.domain.DeliveryTestSamples.*;
import static com.delivery.domain.ProductTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DeliveryItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DeliveryItem.class);
        DeliveryItem deliveryItem1 = getDeliveryItemSample1();
        DeliveryItem deliveryItem2 = new DeliveryItem();
        assertThat(deliveryItem1).isNotEqualTo(deliveryItem2);

        deliveryItem2.setId(deliveryItem1.getId());
        assertThat(deliveryItem1).isEqualTo(deliveryItem2);

        deliveryItem2 = getDeliveryItemSample2();
        assertThat(deliveryItem1).isNotEqualTo(deliveryItem2);
    }

    @Test
    void deliveryTest() {
        DeliveryItem deliveryItem = getDeliveryItemRandomSampleGenerator();
        Delivery deliveryBack = getDeliveryRandomSampleGenerator();

        deliveryItem.setDelivery(deliveryBack);
        assertThat(deliveryItem.getDelivery()).isEqualTo(deliveryBack);

        deliveryItem.delivery(null);
        assertThat(deliveryItem.getDelivery()).isNull();
    }

    @Test
    void productTest() {
        DeliveryItem deliveryItem = getDeliveryItemRandomSampleGenerator();
        Product productBack = getProductRandomSampleGenerator();

        deliveryItem.setProduct(productBack);
        assertThat(deliveryItem.getProduct()).isEqualTo(productBack);

        deliveryItem.product(null);
        assertThat(deliveryItem.getProduct()).isNull();
    }
}
