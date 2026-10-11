package com.electralab.controller;

import com.electralab.dto.FeedbackRequestDto;
import com.electralab.dto.FeedbackResponseDto;
import com.electralab.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponseDto>> getAllFeedback(
            @RequestParam(required = false) String rollNumber) {
        if (rollNumber != null && !rollNumber.isBlank()) {
            return ResponseEntity.ok(feedbackService.getFeedbackByRollNumber(rollNumber));
        }
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @PostMapping
    public ResponseEntity<FeedbackResponseDto> submitFeedback(@Valid @RequestBody FeedbackRequestDto request) {
        FeedbackResponseDto submitted = feedbackService.submitFeedback(request);
        return new ResponseEntity<>(submitted, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<FeedbackResponseDto> resolveFeedback(@PathVariable Long id) {
        FeedbackResponseDto resolved = feedbackService.resolveFeedback(id);
        return ResponseEntity.ok(resolved);
    }
}
