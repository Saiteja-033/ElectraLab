package com.electralab.service;

import com.electralab.config.JwtUtils;
import com.electralab.dto.AdminSetupRequestDto;
import com.electralab.dto.AuthResponseDto;
import com.electralab.dto.LoginRequestDto;
import com.electralab.dto.StudentRegisterRequestDto;
import com.electralab.entity.Role;
import com.electralab.entity.User;
import com.electralab.exception.InvalidOperationException;
import com.electralab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private User studentUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        studentUser = new User("student@electralab.edu", "hashedPwd", "Rahul Sharma", Role.ROLE_STUDENT, "21EC042", "ECE");
        studentUser.setId(1L);

        adminUser = new User("admin@electralab.edu", "hashedAdminPwd", "Prof. Kumar", Role.ROLE_ADMIN, null, "Laboratory Administration");
        adminUser.setId(2L);
    }

    @Test
    @DisplayName("login succeeds with valid credentials and returns token")
    void shouldLoginSuccessfully() {
        LoginRequestDto request = new LoginRequestDto("student@electralab.edu", "password123", "STUDENT");

        when(userRepository.findByEmailIgnoreCase("student@electralab.edu")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("password123", "hashedPwd")).thenReturn(true);
        when(jwtUtils.generateToken(studentUser)).thenReturn("mock.jwt.token");

        AuthResponseDto response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.token());
        assertEquals("student@electralab.edu", response.email());
        assertEquals(Role.ROLE_STUDENT, response.role());
    }

    @Test
    @DisplayName("login rejects wrong password")
    void shouldRejectInvalidPassword() {
        LoginRequestDto request = new LoginRequestDto("student@electralab.edu", "wrongpass", "STUDENT");

        when(userRepository.findByEmailIgnoreCase("student@electralab.edu")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("wrongpass", "hashedPwd")).thenReturn(false);

        assertThrows(InvalidOperationException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("login rejects student attempting to log into admin portal")
    void shouldRejectStudentLoggingIntoAdminPortal() {
        LoginRequestDto request = new LoginRequestDto("student@electralab.edu", "password123", "ADMIN");

        when(userRepository.findByEmailIgnoreCase("student@electralab.edu")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("password123", "hashedPwd")).thenReturn(true);

        assertThrows(InvalidOperationException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("registerStudent encodes password and creates student account")
    void shouldRegisterStudentSuccessfully() {
        StudentRegisterRequestDto request = new StudentRegisterRequestDto();
        request.setFullName("Ananya Sen");
        request.setEmail("ananya@electralab.edu");
        request.setRollNumber("21EC099");
        request.setDepartment("ECE");
        request.setPassword("securePass123");

        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.existsByRollNumberIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode("securePass123")).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(3L);
            return u;
        });
        when(jwtUtils.generateToken(any(User.class))).thenReturn("new.token");

        AuthResponseDto response = authService.registerStudent(request);

        assertNotNull(response);
        assertEquals(3L, response.id());
        assertEquals(Role.ROLE_STUDENT, response.role());
        verify(passwordEncoder).encode("securePass123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("setupInitialAdmin creates admin when no admin exists")
    void shouldSetupInitialAdminWhenNoneExists() {
        AdminSetupRequestDto request = new AdminSetupRequestDto("Dr. Head", "head@electralab.edu", "adminSecret123");

        when(userRepository.countByRole(Role.ROLE_ADMIN)).thenReturn(0L);
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedAdmin");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(4L);
            return u;
        });
        when(jwtUtils.generateToken(any(User.class))).thenReturn("admin.jwt.token");

        AuthResponseDto response = authService.setupInitialAdmin(request);

        assertNotNull(response);
        assertEquals(Role.ROLE_ADMIN, response.role());
    }

    @Test
    @DisplayName("setupInitialAdmin refuses creation if an admin already exists")
    void shouldRefuseSetupWhenAdminAlreadyExists() {
        AdminSetupRequestDto request = new AdminSetupRequestDto("Intruder", "fake@electralab.edu", "pwd123");

        when(userRepository.countByRole(Role.ROLE_ADMIN)).thenReturn(1L);

        assertThrows(InvalidOperationException.class, () -> authService.setupInitialAdmin(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
