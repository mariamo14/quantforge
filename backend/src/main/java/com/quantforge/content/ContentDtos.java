package com.quantforge.content;

import java.util.List;

public final class ContentDtos {

    private ContentDtos() {
    }

    public record TrackSummary(String slug, String title, String icon, String accent,
                               String description, int total, int done) {
    }

    public record ItemDto(String kind, String slug, String title, String difficulty,
                          Integer minutes, Integer questionCount, Integer xp, boolean done,
                          boolean locked) {
    }

    public record NextItemDto(String kind, String slug, String title,
                              String trackSlug, String trackTitle, boolean endOfTrack) {
    }

    public record ItemRef(String kind, String slug, String title) {
    }

    /** Course-player context: where this item sits inside its track. */
    public record ContextDto(String trackSlug, String trackTitle, String accent,
                             int index, int total, int doneCount,
                             ItemRef prev, ItemRef next) {
    }

    public record ModuleDto(String slug, String title, String description, List<ItemDto> items) {
    }

    public record TrackDetail(String slug, String title, String icon, String accent,
                              String description, List<ModuleDto> modules) {
    }

    public record LessonDto(String slug, String title, int minutes, String markdown, boolean done) {
    }

    public record SampleTestDto(String input, String expectedOutput) {
    }

    public record ProblemDto(String slug, String title, String difficulty, int xp, int timeLimitMs,
                             String statementMd, String starterCode, List<SampleTestDto> sampleTests,
                             boolean solved, String editorialMd, String lastSubmittedCode) {
    }

    public record QuizQuestionDto(Long id, String promptMd, List<String> choices) {
    }

    public record QuizDto(String slug, String title, String description, int xpPerCorrect,
                          Integer bestScore, List<QuizQuestionDto> questions) {
    }

    public record DailyChallengeDto(String slug, String title, String difficulty, int xp, boolean solved) {
    }
}
