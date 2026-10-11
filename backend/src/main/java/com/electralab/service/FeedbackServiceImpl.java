package com.electralab.service;

import com.electralab.dto.FeedbackRequestDto;
import com.electralab.dto.FeedbackResponseDto;
import com.electralab.entity.Feedback;
import com.electralab.exception.ResourceNotFoundException;
import com.electralab.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Autowired
    public FeedbackServiceImpl(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(FeedbackResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getFeedbackByRollNumber(String rollNumber) {
        return feedbackRepository.findByRollNumberIgnoreCase(rollNumber).stream()
                .map(FeedbackResponseDto::fromEntity)
                .toList();
    }

    @Override
    public FeedbackResponseDto submitFeedback(FeedbackRequestDto request) {
        Feedback feedback = new Feedback();
        feedback.setStudentName(request.getStudentName() != null ? request.getStudentName().trim() : "Student");
        feedback.setRollNumber(request.getRollNumber() != null ? request.getRollNumber().trim().toUpperCase() : "NA");
        feedback.setType(request.getType() != null ? request.getType().toUpperCase() : "FEEDBACK");
        feedback.setSubject(request.getSubject().trim());
        feedback.setMessage(request.getMessage().trim());
        feedback.setStatus("OPEN");

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackResponseDto.fromEntity(saved);
    }

    @Override
    public FeedbackResponseDto resolveFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));

        feedback.setStatus("RESOLVED");
        Feedback updated = feedbackRepository.save(feedback);
        return FeedbackResponseDto.fromEntity(updated);
    }
}
