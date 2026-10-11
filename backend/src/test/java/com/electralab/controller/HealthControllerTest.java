package com.electralab.controller;

import com.electralab.config.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DataSource dataSource;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("GET /api/health should return status UP and database CONNECTED when database ping succeeds")
    void shouldReturnHealthStatusWhenDatabaseIsConnected() throws Exception {
        Connection mockConnection = mock(Connection.class);
        when(mockConnection.isValid(anyInt())).thenReturn(true);
        when(dataSource.getConnection()).thenReturn(mockConnection);

        mockMvc.perform(get("/api/health")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("ElectraLab"))
                .andExpect(jsonPath("$.database").value("CONNECTED"));
    }

    @Test
    @DisplayName("GET /api/health should return status UP and database DISCONNECTED when database ping fails")
    void shouldReturnHealthStatusWhenDatabaseIsDisconnected() throws Exception {
        when(dataSource.getConnection()).thenThrow(new java.sql.SQLException("Connection failed"));

        mockMvc.perform(get("/api/health")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("ElectraLab"))
                .andExpect(jsonPath("$.database").value("DISCONNECTED"));
    }
}
