package com.electralab.service;

import com.electralab.dto.EquipmentRequestDto;
import com.electralab.dto.EquipmentResponseDto;
import com.electralab.entity.Equipment;
import com.electralab.exception.InvalidOperationException;
import com.electralab.exception.ResourceNotFoundException;
import com.electralab.repository.EquipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @InjectMocks
    private EquipmentServiceImpl equipmentService;

    private Equipment testEquipment;

    @BeforeEach
    void setUp() {
        testEquipment = new Equipment();
        testEquipment.setId(1L);
        testEquipment.setName("Digital Storage Oscilloscope");
        testEquipment.setModelNumber("DSO-X 2012A");
        testEquipment.setCategory("Measuring Instruments");
        testEquipment.setSerialNumber("DSO-001");
        testEquipment.setQuantityAvailable(10);
        testEquipment.setTotalQuantity(10);
        testEquipment.setStatus("AVAILABLE");
        testEquipment.setLocationRack("Rack A-1");
    }

    @Test
    @DisplayName("getAllEquipment returns list of equipment DTOs")
    void shouldReturnAllEquipment() {
        when(equipmentRepository.findAll()).thenReturn(List.of(testEquipment));

        List<EquipmentResponseDto> result = equipmentService.getAllEquipment();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Digital Storage Oscilloscope", result.get(0).name());
        verify(equipmentRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getEquipmentById returns equipment when exists")
    void shouldReturnEquipmentById() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(testEquipment));

        EquipmentResponseDto result = equipmentService.getEquipmentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Digital Storage Oscilloscope", result.name());
    }

    @Test
    @DisplayName("getEquipmentById throws ResourceNotFoundException when not found")
    void shouldThrowExceptionWhenEquipmentNotFound() {
        when(equipmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> equipmentService.getEquipmentById(99L));
    }

    @Test
    @DisplayName("createEquipment successfully creates and saves equipment")
    void shouldCreateEquipmentSuccessfully() {
        EquipmentRequestDto request = new EquipmentRequestDto();
        request.setName("Function Generator");
        request.setCategory("Signal Generators");
        request.setTotalQuantity(5);
        request.setQuantityAvailable(5);
        request.setSerialNumber("GEN-001");

        when(equipmentRepository.findBySerialNumber("GEN-001")).thenReturn(Optional.empty());
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> {
            Equipment eq = invocation.getArgument(0);
            eq.setId(2L);
            return eq;
        });

        EquipmentResponseDto created = equipmentService.createEquipment(request);

        assertNotNull(created);
        assertEquals(2L, created.id());
        assertEquals("Function Generator", created.name());
        assertEquals(5, created.totalQuantity());
        verify(equipmentRepository, times(1)).save(any(Equipment.class));
    }

    @Test
    @DisplayName("createEquipment throws exception if available quantity exceeds total quantity")
    void shouldThrowExceptionWhenAvailableExceedsTotal() {
        EquipmentRequestDto request = new EquipmentRequestDto();
        request.setName("Multimeter");
        request.setCategory("Measuring Instruments");
        request.setTotalQuantity(5);
        request.setQuantityAvailable(10); // Invalid

        assertThrows(InvalidOperationException.class, () -> equipmentService.createEquipment(request));
    }
}
