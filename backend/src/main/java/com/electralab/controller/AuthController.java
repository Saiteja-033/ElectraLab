package com.electralab.controller;

import com.electralab.config.JwtUtils;
import com.electralab.dto.AdminSetupRequestDto;
import com.electralab.dto.AuthResponseDto;
import com.electralab.dto.LoginRequestDto;
import com.electralab.dto.StudentRegisterRequestDto;
import com.electralab.entity.User;
import com.electralab.exception.ResourceNotFoundException;
import com.electralab.repository.UserRepository;
import com.electralab.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthController(AuthService authService, UserRepository userRepository, JwtUtils jwtUtils) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponseDto> registerStudent(@Valid @RequestBody StudentRegisterRequestDto request) {
        AuthResponseDto response = authService.registerStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/setup-admin")
    public ResponseEntity<AuthResponseDto> setupInitialAdmin(@Valid @RequestBody AdminSetupRequestDto request) {
        AuthResponseDto response = authService.setupInitialAdmin(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        try {
            return ResponseEntity.ok(authService.getSystemAuthStatus());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("adminConfigured", true, "databaseStatus", "CONNECTING"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponseDto> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtils.generateToken(user);
        return ResponseEntity.ok(new AuthResponseDto(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getRollNumber(),
                user.getDepartment()
        ));
    }
}
