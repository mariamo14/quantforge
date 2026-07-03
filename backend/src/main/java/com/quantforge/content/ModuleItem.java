package com.quantforge.content;

import jakarta.persistence.*;

@Entity
@Table(name = "module_items")
public class ModuleItem {

    public enum Kind {LESSON, PROBLEM, QUIZ}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private TrackModule module;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Kind kind;

    @ManyToOne(fetch = FetchType.LAZY)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY)
    private Quiz quiz;

    private int sortOrder;

    protected ModuleItem() {
    }

    public static ModuleItem lesson(TrackModule module, Lesson lesson, int sortOrder) {
        ModuleItem item = new ModuleItem();
        item.module = module;
        item.kind = Kind.LESSON;
        item.lesson = lesson;
        item.sortOrder = sortOrder;
        return item;
    }

    public static ModuleItem problem(TrackModule module, Problem problem, int sortOrder) {
        ModuleItem item = new ModuleItem();
        item.module = module;
        item.kind = Kind.PROBLEM;
        item.problem = problem;
        item.sortOrder = sortOrder;
        return item;
    }

    public static ModuleItem quiz(TrackModule module, Quiz quiz, int sortOrder) {
        ModuleItem item = new ModuleItem();
        item.module = module;
        item.kind = Kind.QUIZ;
        item.quiz = quiz;
        item.sortOrder = sortOrder;
        return item;
    }

    public Long getId() {
        return id;
    }

    public TrackModule getModule() {
        return module;
    }

    public Kind getKind() {
        return kind;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public Problem getProblem() {
        return problem;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
