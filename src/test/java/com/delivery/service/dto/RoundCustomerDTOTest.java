package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoundCustomerDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RoundCustomerDTO.class);
        RoundCustomerDTO roundCustomerDTO1 = new RoundCustomerDTO();
        roundCustomerDTO1.setId(1L);
        RoundCustomerDTO roundCustomerDTO2 = new RoundCustomerDTO();
        assertThat(roundCustomerDTO1).isNotEqualTo(roundCustomerDTO2);
        roundCustomerDTO2.setId(roundCustomerDTO1.getId());
        assertThat(roundCustomerDTO1).isEqualTo(roundCustomerDTO2);
        roundCustomerDTO2.setId(2L);
        assertThat(roundCustomerDTO1).isNotEqualTo(roundCustomerDTO2);
        roundCustomerDTO1.setId(null);
        assertThat(roundCustomerDTO1).isNotEqualTo(roundCustomerDTO2);
    }
}
