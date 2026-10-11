package com.electralab.service;

import com.electralab.dto.EquipmentRequestDto;
import com.electralab.dto.EquipmentResponseDto;

import java.util.List;

public interface EquipmentService {

    List<EquipmentResponseDto> getAllEquipment();

    EquipmentResponseDto getEquipmentById(Long id);

    List<EquipmentResponseDto> getEquipmentByCategory(String category);

    List<EquipmentResponseDto> searchEquipment(String query);

    EquipmentResponseDto createEquipment(EquipmentRequestDto request);

    EquipmentResponseDto updateEquipment(Long id, EquipmentRequestDto request);

    void deleteEquipment(Long id);
}
