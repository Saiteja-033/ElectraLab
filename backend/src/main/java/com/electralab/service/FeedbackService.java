package com.electralab.service;

import com.electralab.dto.FeedbackRequestDto;
import com.electralab.dto.FeedbackResponseDto;

import java.util.List;

public interface FeedbackService {

    List<FeedbackResponseDto> getAllFeedback();

    List<FeedbackResponseDto> getFeedbackByRollNumber(String rollNumber);

    FeedbackResponseDto submitFeedback(FeedbackRequestDto request);

    FeedbackResponseDto resolveFeedback(Long id);
}
