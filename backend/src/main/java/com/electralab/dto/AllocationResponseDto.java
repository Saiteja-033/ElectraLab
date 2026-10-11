package com.electralab.dto;

import com.electralab.entity.Allocation;
import java.time.LocalDateTime;

public record AllocationResponseDto(
        Long id,
        String studentName,
        String rollNumber,
        Long equipmentId,
        String equipmentName,
        Integer quantity,
        LocalDateTime issueDate,
        LocalDateTime expectedReturnDate,
        LocalDateTime actualReturnDate,
        String status,
        String remarks,
        LocalDateTime createdAt
) {
    public static AllocationResponseDto fromEntity(Allocation entity) {
        return new AllocationResponseDto(
                entity.getId(),
                entity.getStudentName(),
                entity.getRollNumber(),
                entity.getEquipment() != null ? entity.getEquipment().getId() : null,
                entity.getEquipment() != null ? entity.getEquipment().getName() : null,
                entity.getQuantity(),
                entity.getIssueDate(),
                entity.getExpectedReturnDate(),
                entity.getActualReturnDate(),
                entity.getStatus(),
                entity.getRemarks(),
                entity.getCreatedAt()
        );
    }
}
