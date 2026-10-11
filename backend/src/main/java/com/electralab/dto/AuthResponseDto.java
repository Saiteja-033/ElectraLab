package com.electralab.dto;

import com.electralab.entity.Role;

public record AuthResponseDto(
        String token,
        Long id,
        String email,
        String fullName,
        Role role,
        String rollNumber,
        String department
) {
}
