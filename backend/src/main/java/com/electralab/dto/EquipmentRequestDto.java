package com.electralab.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EquipmentRequestDto {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    private String modelNumber;

    @NotBlank(message = "Category is required")
    private String category;

    private String serialNumber;

    @NotNull(message = "Total quantity is required")
    @Min(value = 0, message = "Total quantity cannot be negative")
    private Integer totalQuantity;

    private Integer quantityAvailable;

    private String status;

    private String locationRack;

    public EquipmentRequestDto() {
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

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
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
}
