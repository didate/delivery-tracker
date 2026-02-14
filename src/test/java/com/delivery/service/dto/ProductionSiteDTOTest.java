package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductionSiteDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProductionSiteDTO.class);
        ProductionSiteDTO productionSiteDTO1 = new ProductionSiteDTO();
        productionSiteDTO1.setId(1L);
        ProductionSiteDTO productionSiteDTO2 = new ProductionSiteDTO();
        assertThat(productionSiteDTO1).isNotEqualTo(productionSiteDTO2);
        productionSiteDTO2.setId(productionSiteDTO1.getId());
        assertThat(productionSiteDTO1).isEqualTo(productionSiteDTO2);
        productionSiteDTO2.setId(2L);
        assertThat(productionSiteDTO1).isNotEqualTo(productionSiteDTO2);
        productionSiteDTO1.setId(null);
        assertThat(productionSiteDTO1).isNotEqualTo(productionSiteDTO2);
    }
}
