package com.electralab.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity representing laboratory equipment or component instruments.
 */
@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "model_number", length = 100)
    private String modelNumber;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "serial_number", unique = true, length = 100)
    private String serialNumber;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "location_rack", length = 100)
    private String locationRack;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Equipment() {
    }

    public Equipment(String name, String modelNumber, String category, String serialNumber,
                     Integer quantityAvailable, Integer totalQuantity, String status, String locationRack) {
        this.name = name;
        this.modelNumber = modelNumber;
        this.category = category;
        this.serialNumber = serialNumber;
        this.quantityAvailable = quantityAvailable;
        this.totalQuantity = totalQuantity;
        this.status = status;
        this.locationRack = locationRack;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "AVAILABLE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Integer getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocationRack() {
        return locationRack;
    }

    public void setLocationRack(String locationRack) {
        this.locationRack = locationRack;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
