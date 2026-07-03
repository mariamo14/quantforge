package com.quantforge.content;

import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Problem problem;

    private int sortOrder;

    @Lob
    @Column(nullable = false)
    private String input;

    @Lob
    @Column(nullable = false)
    private String expectedOutput;

    private boolean sample;

    protected TestCase() {
    }

    public TestCase(Problem problem, int sortOrder, String input, String expectedOutput, boolean sample) {
        this.problem = problem;
        this.sortOrder = sortOrder;
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.sample = sample;
    }

    public Long getId() {
        return id;
    }

    public Problem getProblem() {
        return problem;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getInput() {
        return input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public boolean isSample() {
        return sample;
    }
}
