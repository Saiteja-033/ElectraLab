package com.electralab.service;

import com.electralab.dto.EquipmentRequestDto;
import com.electralab.dto.EquipmentResponseDto;
import com.electralab.entity.Equipment;
import com.electralab.exception.InvalidOperationException;
import com.electralab.exception.ResourceNotFoundException;
import com.electralab.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;

    @Autowired
    public EquipmentServiceImpl(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponseDto> getAllEquipment() {
        return equipmentRepository.findAll().stream()
                .map(EquipmentResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponseDto getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        return EquipmentResponseDto.fromEntity(equipment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponseDto> getEquipmentByCategory(String category) {
        return equipmentRepository.findByCategoryIgnoreCase(category).stream()
                .map(EquipmentResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponseDto> searchEquipment(String query) {
        return equipmentRepository.findByNameContainingIgnoreCase(query).stream()
                .map(EquipmentResponseDto::fromEntity)
                .toList();
    }

    @Override
    public EquipmentResponseDto createEquipment(EquipmentRequestDto request) {
        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()) {
            equipmentRepository.findBySerialNumber(request.getSerialNumber().trim())
                    .ifPresent(existing -> {
                        throw new InvalidOperationException("Equipment with serial number " + request.getSerialNumber() + " already exists");
                    });
        }

        Equipment equipment = new Equipment();
        equipment.setName(request.getName().trim());
        equipment.setModelNumber(request.getModelNumber());
        equipment.setCategory(request.getCategory().trim());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setTotalQuantity(request.getTotalQuantity());

        int available = request.getQuantityAvailable() != null ? request.getQuantityAvailable() : request.getTotalQuantity();
        if (available > request.getTotalQuantity()) {
            throw new InvalidOperationException("Available quantity cannot exceed total quantity");
        }
        equipment.setQuantityAvailable(available);

        String status = request.getStatus();
        if (status == null || status.isBlank()) {
            status = available > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
        }
        equipment.setStatus(status.toUpperCase());
        equipment.setLocationRack(request.getLocationRack());

        Equipment saved = equipmentRepository.save(equipment);
        return EquipmentResponseDto.fromEntity(saved);
    }

    @Override
    public EquipmentResponseDto updateEquipment(Long id, EquipmentRequestDto request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()) {
            equipmentRepository.findBySerialNumber(request.getSerialNumber().trim())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new InvalidOperationException("Serial number already in use by another equipment");
                        }
                    });
            equipment.setSerialNumber(request.getSerialNumber().trim());
        }

        equipment.setName(request.getName().trim());
        equipment.setModelNumber(request.getModelNumber());
        equipment.setCategory(request.getCategory().trim());
        equipment.setTotalQuantity(request.getTotalQuantity());

        if (request.getQuantityAvailable() != null) {
            if (request.getQuantityAvailable() > request.getTotalQuantity()) {
                throw new InvalidOperationException("Available quantity cannot exceed total quantity");
            }
            equipment.setQuantityAvailable(request.getQuantityAvailable());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            equipment.setStatus(request.getStatus().toUpperCase());
        } else {
            equipment.setStatus(equipment.getQuantityAvailable() > 0 ? "AVAILABLE" : "OUT_OF_STOCK");
        }

        equipment.setLocationRack(request.getLocationRack());
        Equipment updated = equipmentRepository.save(equipment);
        return EquipmentResponseDto.fromEntity(updated);
    }

    @Override
    public void deleteEquipment(Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found with ID: " + id);
        }
        equipmentRepository.deleteById(id);
    }
}
