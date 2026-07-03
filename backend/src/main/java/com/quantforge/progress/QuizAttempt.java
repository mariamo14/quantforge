package com.quantforge.progress;

import com.quantforge.auth.User;
import com.quantforge.content.Quiz;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Quiz quiz;

    private int score;

    private int total;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected QuizAttempt() {
    }

    public QuizAttempt(User user, Quiz quiz, int score, int total) {
        this.user = user;
        this.quiz = quiz;
        this.score = score;
        this.total = total;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public int getScore() {
        return score;
    }

    public int getTotal() {
        return total;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
