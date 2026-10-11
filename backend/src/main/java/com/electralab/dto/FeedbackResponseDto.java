package com.electralab.dto;

import com.electralab.entity.Feedback;
import java.time.LocalDateTime;

public record FeedbackResponseDto(
        Long id,
        String studentName,
        String rollNumber,
        String type,
        String subject,
        String message,
        String status,
        LocalDateTime createdAt
) {
    public static FeedbackResponseDto fromEntity(Feedback entity) {
        return new FeedbackResponseDto(
                entity.getId(),
                entity.getStudentName(),
                entity.getRollNumber(),
                entity.getType(),
                entity.getSubject(),
                entity.getMessage(),
                entity.getStatus(),
                entity.getCreatedAt()
        );
    }
}
