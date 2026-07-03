package com.quantforge.content;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private int xpPerCorrect = 8;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder")
    private List<QuizQuestion> questions = new ArrayList<>();

    protected Quiz() {
    }

    public Quiz(String slug) {
        this.slug = slug;
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getXpPerCorrect() {
        return xpPerCorrect;
    }

    public void setXpPerCorrect(int xpPerCorrect) {
        this.xpPerCorrect = xpPerCorrect;
    }

    public List<QuizQuestion> getQuestions() {
        return questions;
    }
}
