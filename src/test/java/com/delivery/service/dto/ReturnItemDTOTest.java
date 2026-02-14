package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ReturnItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ReturnItemDTO.class);
        ReturnItemDTO returnItemDTO1 = new ReturnItemDTO();
        returnItemDTO1.setId(1L);
        ReturnItemDTO returnItemDTO2 = new ReturnItemDTO();
        assertThat(returnItemDTO1).isNotEqualTo(returnItemDTO2);
        returnItemDTO2.setId(returnItemDTO1.getId());
        assertThat(returnItemDTO1).isEqualTo(returnItemDTO2);
        returnItemDTO2.setId(2L);
        assertThat(returnItemDTO1).isNotEqualTo(returnItemDTO2);
        returnItemDTO1.setId(null);
        assertThat(returnItemDTO1).isNotEqualTo(returnItemDTO2);
    }
}
