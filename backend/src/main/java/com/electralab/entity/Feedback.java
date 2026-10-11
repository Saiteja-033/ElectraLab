package com.electralab.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "roll_number", nullable = false, length = 50)
    private String rollNumber;

    @Column(nullable = false, length = 50)
    private String type; // FEEDBACK or MAINTENANCE_REPORT

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false, length = 50)
    private String status = "OPEN"; // OPEN or RESOLVED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Feedback() {
    }

    public Feedback(String studentName, String rollNumber, String type, String subject, String message) {
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.type = type;
        this.subject = subject;
        this.message = message;
        this.status = "OPEN";
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "OPEN";
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
