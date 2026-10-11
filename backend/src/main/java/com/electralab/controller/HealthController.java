package com.electralab.controller;

import com.electralab.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Health Controller providing operational status and database connectivity of the ElectraLab API.
 * Credentials and sensitive database configurations are never exposed.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;

    @Autowired
    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> checkHealth() {
        boolean isDbHealthy = false;
        try (Connection connection = dataSource.getConnection()) {
            isDbHealthy = connection != null && connection.isValid(2);
        } catch (Exception ignored) {
            // Safe silent handling; connection failures report DISCONNECTED without leaking details
        }

        if (isDbHealthy) {
            return ResponseEntity.ok(new HealthResponse("UP", "ElectraLab", "CONNECTED"));
        } else {
            return ResponseEntity.ok(new HealthResponse("UP", "ElectraLab", "DISCONNECTED"));
        }
    }
}
