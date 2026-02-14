package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProductionDTO.class);
        ProductionDTO productionDTO1 = new ProductionDTO();
        productionDTO1.setId(1L);
        ProductionDTO productionDTO2 = new ProductionDTO();
        assertThat(productionDTO1).isNotEqualTo(productionDTO2);
        productionDTO2.setId(productionDTO1.getId());
        assertThat(productionDTO1).isEqualTo(productionDTO2);
        productionDTO2.setId(2L);
        assertThat(productionDTO1).isNotEqualTo(productionDTO2);
        productionDTO1.setId(null);
        assertThat(productionDTO1).isNotEqualTo(productionDTO2);
    }
}
