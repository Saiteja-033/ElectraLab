-- =====================================================================
-- ElectraLab - Electronics Laboratory Management System
-- Database Schema Definition (MySQL on Aiven Cloud)
-- =====================================================================

CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    model_number VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    quantity_available INT NOT NULL DEFAULT 0,
    total_quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    location_rack VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(150) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    equipment_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    issue_date DATETIME NOT NULL,
    expected_return_date DATETIME,
    actual_return_date DATETIME,
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocation_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_allocation_roll_number ON allocations(roll_number);
CREATE INDEX idx_allocation_status ON allocations(status);

-- Initial seed data for electronics laboratory equipment
INSERT IGNORE INTO equipment (id, name, model_number, category, serial_number, quantity_available, total_quantity, status, location_rack) VALUES
(1, 'Digital Storage Oscilloscope (100MHz)', 'DSO-X 2012A', 'Measuring Instruments', 'DSO-2024-001', 12, 12, 'AVAILABLE', 'Rack A-1'),
(2, 'Function / Arbitrary Waveform Generator', 'AFG-2225', 'Signal Generators', 'GEN-2024-002', 10, 10, 'AVAILABLE', 'Rack A-2'),
(3, 'Digital Multimeter (True RMS)', 'Fluke 179', 'Measuring Instruments', 'DMM-2024-003', 25, 25, 'AVAILABLE', 'Rack B-1'),
(4, 'Triple Output DC Power Supply', 'GPS-3303', 'Power Supplies', 'PWR-2024-004', 15, 15, 'AVAILABLE', 'Rack B-2'),
(5, 'Arduino Uno R3 Experimenter Kit', 'ARD-UNO-R3', 'Components & Kits', 'KIT-2024-005', 30, 30, 'AVAILABLE', 'Rack C-1'),
(6, 'FPGA Development Board (Spartan-6)', 'NEXYS-3', 'Components & Kits', 'FPGA-2024-006', 8, 8, 'AVAILABLE', 'Rack C-2'),
(7, 'Digital Temperature-Controlled Soldering Station', 'HAKKO FX-888D', 'Soldering & Tools', 'SLD-2024-007', 10, 10, 'AVAILABLE', 'Workstation 1-10');
