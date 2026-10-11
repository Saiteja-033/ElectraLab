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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto request) {
        String identifier = request.getEmail().trim();

        // Allow login by email or student roll number
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> u.getRollNumber() != null && u.getRollNumber().equalsIgnoreCase(identifier))
                        .findFirst()
                        .orElseThrow(() -> new InvalidOperationException("Invalid credentials: user not found")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidOperationException("Invalid credentials: incorrect password");
        }

        if (!user.isActive()) {
            throw new InvalidOperationException("Account is deactivated. Please contact laboratory administration.");
        }

        // Validate portal role alignment
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String expectedRole = request.getRole().toUpperCase();
            if (expectedRole.contains("ADMIN") && user.getRole() != Role.ROLE_ADMIN) {
                throw new InvalidOperationException("Access Denied: This account is a Student account. Please log in via Student Login.");
            }
            if (expectedRole.contains("STUDENT") && user.getRole() != Role.ROLE_STUDENT) {
                throw new InvalidOperationException("Access Denied: This account is an Administrator account. Please log in via Admin Login.");
            }
        }

        String token = jwtUtils.generateToken(user);
        return new AuthResponseDto(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getRollNumber(),
                user.getDepartment()
        );
    }

    @Override
    public AuthResponseDto registerStudent(StudentRegisterRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();
        String rollNumber = request.getRollNumber().trim().toUpperCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new InvalidOperationException("An account with email " + email + " already exists.");
        }

        if (userRepository.existsByRollNumberIgnoreCase(rollNumber)) {
            throw new InvalidOperationException("An account with roll number " + rollNumber + " already exists.");
        }

        User student = new User();
        student.setFullName(request.getFullName().trim());
        student.setEmail(email);
        student.setRollNumber(rollNumber);
        student.setDepartment(request.getDepartment().trim());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(Role.ROLE_STUDENT);
        student.setActive(true);

        User saved = userRepository.save(student);
        String token = jwtUtils.generateToken(saved);

        return new AuthResponseDto(
                token,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole(),
                saved.getRollNumber(),
                saved.getDepartment()
        );
    }

    @Override
    public AuthResponseDto setupInitialAdmin(AdminSetupRequestDto request) {
        long adminCount = userRepository.countByRole(Role.ROLE_ADMIN);
        if (adminCount > 0) {
            throw new InvalidOperationException("Primary Administrator is already configured. Public admin registration is strictly disabled.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new InvalidOperationException("An account with email " + email + " already exists.");
        }

        User admin = new User();
        admin.setFullName(request.getFullName().trim());
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setDepartment("Laboratory Administration");
        admin.setActive(true);

        User saved = userRepository.save(admin);
        String token = jwtUtils.generateToken(saved);

        return new AuthResponseDto(
                token,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole(),
                saved.getRollNumber(),
                saved.getDepartment()
        );
    }

    @Override
    public Map<String, Object> getSystemAuthStatus() {
        Map<String, Object> status = new HashMap<>();
        try {
            long adminCount = userRepository.countByRole(Role.ROLE_ADMIN);
            status.put("adminConfigured", adminCount > 0);
        } catch (Exception e) {
            status.put("adminConfigured", true);
            status.put("databaseError", "Database unreachable");
        }
        return status;
    }
}
