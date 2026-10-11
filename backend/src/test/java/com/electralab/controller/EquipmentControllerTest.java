package com.electralab.controller;

import com.electralab.config.JwtUtils;
import com.electralab.dto.EquipmentResponseDto;
import com.electralab.service.EquipmentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EquipmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class EquipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EquipmentService equipmentService;

    @MockBean
    private DataSource dataSource;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("GET /api/equipment returns list of equipment")
    void shouldReturnAllEquipment() throws Exception {
        EquipmentResponseDto dto = new EquipmentResponseDto(
                1L,
                "Digital Storage Oscilloscope",
                "DSO-X 2012A",
                "Measuring Instruments",
                "DSO-001",
                10,
                10,
                "AVAILABLE",
                "Rack A-1",
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(equipmentService.getAllEquipment()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/equipment")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Digital Storage Oscilloscope"))
                .andExpect(jsonPath("$[0].category").value("Measuring Instruments"));
    }
}
