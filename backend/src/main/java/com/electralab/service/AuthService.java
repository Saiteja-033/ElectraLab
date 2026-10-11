package com.electralab.service;

import com.electralab.dto.AdminSetupRequestDto;
import com.electralab.dto.AuthResponseDto;
import com.electralab.dto.LoginRequestDto;
import com.electralab.dto.StudentRegisterRequestDto;

import java.util.Map;

public interface AuthService {

    AuthResponseDto login(LoginRequestDto request);

    AuthResponseDto registerStudent(StudentRegisterRequestDto request);

    AuthResponseDto setupInitialAdmin(AdminSetupRequestDto request);

    Map<String, Object> getSystemAuthStatus();
}
