package com.quantforge.progress;

import com.quantforge.auth.User;
import com.quantforge.content.Lesson;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "lesson_completions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
public class LessonCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Lesson lesson;

    @Column(nullable = false)
    private Instant completedAt = Instant.now();

    protected LessonCompletion() {
    }

    public LessonCompletion(User user, Lesson lesson) {
        this.user = user;
        this.lesson = lesson;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
