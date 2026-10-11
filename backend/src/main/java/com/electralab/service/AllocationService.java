package com.electralab.service;

import com.electralab.dto.AllocationRequestDto;
import com.electralab.dto.AllocationResponseDto;

import java.util.List;

public interface AllocationService {

    List<AllocationResponseDto> getAllAllocations();

    List<AllocationResponseDto> getAllocationsByRollNumber(String rollNumber);

    AllocationResponseDto issueEquipment(AllocationRequestDto request);

    AllocationResponseDto returnEquipment(Long allocationId, String remarks);
}
