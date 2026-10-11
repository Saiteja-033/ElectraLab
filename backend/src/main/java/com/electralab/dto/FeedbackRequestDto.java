package com.electralab.dto;

import jakarta.validation.constraints.NotBlank;

public class FeedbackRequestDto {

    private String studentName;

    private String rollNumber;

    @NotBlank(message = "Type is required (FEEDBACK or MAINTENANCE_REPORT)")
    private String type;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message details are required")
    private String message;

    public FeedbackRequestDto() {
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
}
