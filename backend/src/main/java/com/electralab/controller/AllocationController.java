package com.electralab.controller;

import com.electralab.dto.AllocationRequestDto;
import com.electralab.dto.AllocationResponseDto;
import com.electralab.service.AllocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    @Autowired
    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public ResponseEntity<List<AllocationResponseDto>> getAllAllocations(
            @RequestParam(required = false) String rollNumber) {
        if (rollNumber != null && !rollNumber.isBlank()) {
            return ResponseEntity.ok(allocationService.getAllocationsByRollNumber(rollNumber));
        }
        return ResponseEntity.ok(allocationService.getAllAllocations());
    }

    @PostMapping("/issue")
    public ResponseEntity<AllocationResponseDto> issueEquipment(
            @Valid @RequestBody AllocationRequestDto request) {
        AllocationResponseDto issued = allocationService.issueEquipment(request);
        return new ResponseEntity<>(issued, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<AllocationResponseDto> returnEquipment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        AllocationResponseDto returned = allocationService.returnEquipment(id, remarks);
        return ResponseEntity.ok(returned);
    }
}
