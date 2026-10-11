package com.electralab.dto;

/**
 * Health response DTO.
 *
 * @param status      Application operational status (e.g., "UP" or "DOWN")
 * @param application Application identifier ("ElectraLab")
 * @param database    Database connectivity status (e.g., "CONNECTED" or "DISCONNECTED")
 */
public record HealthResponse(String status, String application, String database) {
}
