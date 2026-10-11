package com.electralab.repository;

import com.electralab.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByCategoryIgnoreCase(String category);

    List<Equipment> findByStatusIgnoreCase(String status);

    List<Equipment> findByNameContainingIgnoreCase(String name);

    Optional<Equipment> findBySerialNumber(String serialNumber);
}
