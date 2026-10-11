package com.electralab.repository;

import com.electralab.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByRollNumberIgnoreCase(String rollNumber);

    List<Feedback> findByStatusIgnoreCase(String status);
}
