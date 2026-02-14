package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductReturnDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProductReturnDTO.class);
        ProductReturnDTO productReturnDTO1 = new ProductReturnDTO();
        productReturnDTO1.setId(1L);
        ProductReturnDTO productReturnDTO2 = new ProductReturnDTO();
        assertThat(productReturnDTO1).isNotEqualTo(productReturnDTO2);
        productReturnDTO2.setId(productReturnDTO1.getId());
        assertThat(productReturnDTO1).isEqualTo(productReturnDTO2);
        productReturnDTO2.setId(2L);
        assertThat(productReturnDTO1).isNotEqualTo(productReturnDTO2);
        productReturnDTO1.setId(null);
        assertThat(productReturnDTO1).isNotEqualTo(productReturnDTO2);
    }
}
