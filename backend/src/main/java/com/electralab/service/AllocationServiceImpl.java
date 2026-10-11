package com.electralab.service;

import com.electralab.dto.AllocationRequestDto;
import com.electralab.dto.AllocationResponseDto;
import com.electralab.entity.Allocation;
import com.electralab.entity.Equipment;
import com.electralab.exception.InvalidOperationException;
import com.electralab.exception.ResourceNotFoundException;
import com.electralab.repository.AllocationRepository;
import com.electralab.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AllocationServiceImpl implements AllocationService {

    private final AllocationRepository allocationRepository;
    private final EquipmentRepository equipmentRepository;

    @Autowired
    public AllocationServiceImpl(AllocationRepository allocationRepository, EquipmentRepository equipmentRepository) {
        this.allocationRepository = allocationRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllocationResponseDto> getAllAllocations() {
        return allocationRepository.findAll().stream()
                .map(AllocationResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllocationResponseDto> getAllocationsByRollNumber(String rollNumber) {
        return allocationRepository.findByRollNumberIgnoreCase(rollNumber).stream()
                .map(AllocationResponseDto::fromEntity)
                .toList();
    }

    @Override
    public AllocationResponseDto issueEquipment(AllocationRequestDto request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        if (equipment.getQuantityAvailable() < request.getQuantity()) {
            throw new InvalidOperationException("Insufficient quantity available. Requested: "
                    + request.getQuantity() + ", Available: " + equipment.getQuantityAvailable());
        }

        // Deduct available stock
        equipment.setQuantityAvailable(equipment.getQuantityAvailable() - request.getQuantity());
        if (equipment.getQuantityAvailable() == 0) {
            equipment.setStatus("IN_USE");
        }
        equipmentRepository.save(equipment);

        Allocation allocation = new Allocation();
        allocation.setStudentName(request.getStudentName().trim());
        allocation.setRollNumber(request.getRollNumber().trim().toUpperCase());
        allocation.setEquipment(equipment);
        allocation.setQuantity(request.getQuantity());
        allocation.setIssueDate(LocalDateTime.now());
        allocation.setExpectedReturnDate(request.getExpectedReturnDate());
        allocation.setStatus("ISSUED");
        allocation.setRemarks(request.getRemarks());

        Allocation saved = allocationRepository.save(allocation);
        return AllocationResponseDto.fromEntity(saved);
    }

    @Override
    public AllocationResponseDto returnEquipment(Long allocationId, String remarks) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found with ID: " + allocationId));

        if ("RETURNED".equalsIgnoreCase(allocation.getStatus())) {
            throw new InvalidOperationException("Equipment for this allocation record has already been returned");
        }

        Equipment equipment = allocation.getEquipment();
        if (equipment != null) {
            equipment.setQuantityAvailable(equipment.getQuantityAvailable() + allocation.getQuantity());
            if ("IN_USE".equalsIgnoreCase(equipment.getStatus()) && equipment.getQuantityAvailable() > 0) {
                equipment.setStatus("AVAILABLE");
            }
            equipmentRepository.save(equipment);
        }

        allocation.setStatus("RETURNED");
        allocation.setActualReturnDate(LocalDateTime.now());
        if (remarks != null && !remarks.isBlank()) {
            allocation.setRemarks(remarks.trim());
        }

        Allocation updated = allocationRepository.save(allocation);
        return AllocationResponseDto.fromEntity(updated);
    }
}
