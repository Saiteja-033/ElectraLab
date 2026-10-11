package com.electralab.repository;

import com.electralab.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    List<Allocation> findByRollNumberIgnoreCase(String rollNumber);

    List<Allocation> findByStatusIgnoreCase(String status);

    List<Allocation> findByEquipmentId(Long equipmentId);
}
