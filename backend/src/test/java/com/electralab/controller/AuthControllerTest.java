package com.electralab.controller;

import com.electralab.config.JwtUtils;
import com.electralab.dto.AuthResponseDto;
import com.electralab.dto.LoginRequestDto;
import com.electralab.entity.Role;
import com.electralab.repository.UserRepository;
import com.electralab.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private DataSource dataSource;

    @Test
    @DisplayName("POST /api/auth/login returns token and profile on valid credentials")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequestDto request = new LoginRequestDto("student@electralab.edu", "password123", "STUDENT");
        AuthResponseDto response = new AuthResponseDto(
                "token.xyz",
                1L,
                "student@electralab.edu",
                "Rahul Sharma",
                Role.ROLE_STUDENT,
                "21EC042",
                "ECE"
        );

        when(authService.login(any(LoginRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token.xyz"))
                .andExpect(jsonPath("$.email").value("student@electralab.edu"))
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"));
    }
}
