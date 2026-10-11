package com.electralab.controller;

import com.electralab.dto.EquipmentRequestDto;
import com.electralab.dto.EquipmentResponseDto;
import com.electralab.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @Autowired
    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentResponseDto>> getAllEquipment(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(equipmentService.getEquipmentByCategory(category));
        }
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(equipmentService.searchEquipment(search));
        }
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponseDto> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @PostMapping
    public ResponseEntity<EquipmentResponseDto> createEquipment(@Valid @RequestBody EquipmentRequestDto request) {
        EquipmentResponseDto created = equipmentService.createEquipment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentResponseDto> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequestDto request) {
        EquipmentResponseDto updated = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}
