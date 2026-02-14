package com.delivery.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.delivery.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoundDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RoundDTO.class);
        RoundDTO roundDTO1 = new RoundDTO();
        roundDTO1.setId(1L);
        RoundDTO roundDTO2 = new RoundDTO();
        assertThat(roundDTO1).isNotEqualTo(roundDTO2);
        roundDTO2.setId(roundDTO1.getId());
        assertThat(roundDTO1).isEqualTo(roundDTO2);
        roundDTO2.setId(2L);
        assertThat(roundDTO1).isNotEqualTo(roundDTO2);
        roundDTO1.setId(null);
        assertThat(roundDTO1).isNotEqualTo(roundDTO2);
    }
}
