package com.electralab.controller;

import com.electralab.dto.EquipmentResponseDto;
import com.electralab.entity.Equipment;
import com.electralab.entity.Role;
import com.electralab.entity.User;
import com.electralab.exception.ResourceNotFoundException;
import com.electralab.repository.EquipmentRepository;
import com.electralab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Autowired
    public AdminController(UserRepository userRepository, EquipmentRepository equipmentRepository) {
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        List<Map<String, Object>> students = userRepository.findByRole(Role.ROLE_STUDENT).stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("fullName", user.getFullName());
                    map.put("email", user.getEmail());
                    map.put("rollNumber", user.getRollNumber());
                    map.put("department", user.getDepartment());
                    map.put("active", user.isActive());
                    map.put("createdAt", user.getCreatedAt());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(students);
    }

    @PatchMapping("/students/{id}/status")
    public ResponseEntity<Map<String, Object>> toggleStudentStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        user.setActive(!user.isActive());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("active", user.isActive());
        response.put("message", "Student status updated to " + (user.isActive() ? "Active" : "Deactivated"));
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/equipment/{id}/maintenance")
    public ResponseEntity<EquipmentResponseDto> updateEquipmentMaintenanceStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        String upperStatus = status.trim().toUpperCase();
        equipment.setStatus(upperStatus);
        if ("MAINTENANCE".equalsIgnoreCase(upperStatus) || "DAMAGED".equalsIgnoreCase(upperStatus)) {
            equipment.setQuantityAvailable(0);
        } else if ("AVAILABLE".equalsIgnoreCase(upperStatus) && equipment.getQuantityAvailable() == 0) {
            equipment.setQuantityAvailable(equipment.getTotalQuantity());
        }

        Equipment updated = equipmentRepository.save(equipment);
        return ResponseEntity.ok(EquipmentResponseDto.fromEntity(updated));
    }
}
