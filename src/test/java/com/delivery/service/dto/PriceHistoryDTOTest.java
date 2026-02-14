package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PriceHistoryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PriceHistoryDTO.class);
        PriceHistoryDTO priceHistoryDTO1 = new PriceHistoryDTO();
        priceHistoryDTO1.setId(1L);
        PriceHistoryDTO priceHistoryDTO2 = new PriceHistoryDTO();
        assertThat(priceHistoryDTO1).isNotEqualTo(priceHistoryDTO2);
        priceHistoryDTO2.setId(priceHistoryDTO1.getId());
        assertThat(priceHistoryDTO1).isEqualTo(priceHistoryDTO2);
        priceHistoryDTO2.setId(2L);
        assertThat(priceHistoryDTO1).isNotEqualTo(priceHistoryDTO2);
        priceHistoryDTO1.setId(null);
        assertThat(priceHistoryDTO1).isNotEqualTo(priceHistoryDTO2);
    }
}
