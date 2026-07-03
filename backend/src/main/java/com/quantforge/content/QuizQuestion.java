package com.quantforge.content;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Quiz quiz;

    private int sortOrder;

    @Lob
    @Column(nullable = false)
    private String promptMd;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "quiz_question_choices")
    @OrderColumn(name = "choice_index")
    @Lob
    private List<String> choices = new ArrayList<>();

    private int correctIndex;

    @Lob
    private String explanationMd;

    protected QuizQuestion() {
    }

    public QuizQuestion(Quiz quiz, int sortOrder, String promptMd, List<String> choices,
                        int correctIndex, String explanationMd) {
        this.quiz = quiz;
        this.sortOrder = sortOrder;
        this.promptMd = promptMd;
        this.choices = new ArrayList<>(choices);
        this.correctIndex = correctIndex;
        this.explanationMd = explanationMd;
    }

    public Long getId() {
        return id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getPromptMd() {
        return promptMd;
    }

    public List<String> getChoices() {
        return choices;
    }

    public int getCorrectIndex() {
        return correctIndex;
    }

    public String getExplanationMd() {
        return explanationMd;
    }
}
