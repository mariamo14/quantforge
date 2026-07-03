package com.quantforge.content;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    public enum Difficulty {EASY, MEDIUM, HARD}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty = Difficulty.MEDIUM;

    private int xp = 100;

    private int timeLimitMs = 2000;

    @Lob
    @Column(nullable = false)
    private String statementMd;

    @Lob
    @Column(nullable = false)
    private String starterCode;

    @Lob
    @Column(nullable = false)
    private String referenceSolution;

    @Lob
    private String editorialMd;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder")
    private List<TestCase> testCases = new ArrayList<>();

    protected Problem() {
    }

    public Problem(String slug) {
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

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getTimeLimitMs() {
        return timeLimitMs;
    }

    public void setTimeLimitMs(int timeLimitMs) {
        this.timeLimitMs = timeLimitMs;
    }

    public String getStatementMd() {
        return statementMd;
    }

    public void setStatementMd(String statementMd) {
        this.statementMd = statementMd;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }

    public String getReferenceSolution() {
        return referenceSolution;
    }

    public void setReferenceSolution(String referenceSolution) {
        this.referenceSolution = referenceSolution;
    }

    public String getEditorialMd() {
        return editorialMd;
    }

    public void setEditorialMd(String editorialMd) {
        this.editorialMd = editorialMd;
    }

    public List<TestCase> getTestCases() {
        return testCases;
    }
}
