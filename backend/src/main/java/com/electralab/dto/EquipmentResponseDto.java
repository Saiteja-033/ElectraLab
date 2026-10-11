package com.electralab.dto;

import com.electralab.entity.Equipment;
import java.time.LocalDateTime;

public record EquipmentResponseDto(
        Long id,
        String name,
        String modelNumber,
        String category,
        String serialNumber,
        Integer quantityAvailable,
        Integer totalQuantity,
        String status,
        String locationRack,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static EquipmentResponseDto fromEntity(Equipment entity) {
        return new EquipmentResponseDto(
                entity.getId(),
                entity.getName(),
                entity.getModelNumber(),
                entity.getCategory(),
                entity.getSerialNumber(),
                entity.getQuantityAvailable(),
                entity.getTotalQuantity(),
                entity.getStatus(),
                entity.getLocationRack(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
