package com.quantforge.progress;

import com.quantforge.auth.User;
import com.quantforge.content.Problem;
import com.quantforge.judge.Verdict;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Problem problem;

    @Lob
    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Verdict verdict;

    private int passedCount;

    private int totalCount;

    private long maxTimeMs;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Submission() {
    }

    public Submission(User user, Problem problem, String code, Verdict verdict,
                      int passedCount, int totalCount, long maxTimeMs) {
        this.user = user;
        this.problem = problem;
        this.code = code;
        this.verdict = verdict;
        this.passedCount = passedCount;
        this.totalCount = totalCount;
        this.maxTimeMs = maxTimeMs;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Problem getProblem() {
        return problem;
    }

    public String getCode() {
        return code;
    }

    public Verdict getVerdict() {
        return verdict;
    }

    public int getPassedCount() {
        return passedCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public long getMaxTimeMs() {
        return maxTimeMs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
