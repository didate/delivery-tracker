package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DeliveryItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DeliveryItemDTO.class);
        DeliveryItemDTO deliveryItemDTO1 = new DeliveryItemDTO();
        deliveryItemDTO1.setId(1L);
        DeliveryItemDTO deliveryItemDTO2 = new DeliveryItemDTO();
        assertThat(deliveryItemDTO1).isNotEqualTo(deliveryItemDTO2);
        deliveryItemDTO2.setId(deliveryItemDTO1.getId());
        assertThat(deliveryItemDTO1).isEqualTo(deliveryItemDTO2);
        deliveryItemDTO2.setId(2L);
        assertThat(deliveryItemDTO1).isNotEqualTo(deliveryItemDTO2);
        deliveryItemDTO1.setId(null);
        assertThat(deliveryItemDTO1).isNotEqualTo(deliveryItemDTO2);
    }
}
