package com.quantforge.progress;

import com.quantforge.judge.Verdict;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);

    List<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(Long userId, Long problemId);

    boolean existsByUserIdAndProblemIdAndVerdict(Long userId, Long problemId, Verdict verdict);

    List<Submission> findByUserIdAndVerdict(Long userId, Verdict verdict);

    List<Submission> findByUserId(Long userId);
}
