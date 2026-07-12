package com.quantforge.content;

import com.quantforge.judge.JudgeResult;
import com.quantforge.judge.JudgeService;
import com.quantforge.judge.Verdict;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Seeds the real content/ directory and validates it end-to-end:
 * every reference solution must be ACCEPTED by the judge on its own tests,
 * every quiz answer index must be in range, every track item must resolve.
 */
@SpringBootTest
@ActiveProfiles("contenttest")
@Transactional
class ContentValidationTest {

    @Autowired
    private TrackRepository tracks;
    @Autowired
    private ProblemRepository problems;
    @Autowired
    private QuizRepository quizzes;
    @Autowired
    private LessonRepository lessons;
    @Autowired
    private JudgeService judge;

    @Test
    void contentVolumeMatchesPlan() {
        assertEquals(6, tracks.count(), "tracks");
        assertTrue(lessons.count() >= 69, "expected at least 69 lessons, got " + lessons.count());
        assertEquals(36, problems.count(), "problems");
        assertTrue(quizzes.count() >= 34, "quizzes");
    }

    @Test
    void everyTrackStartsWithALesson() {
        // Step-by-step principle: a from-zero learner's first step is always a lesson,
        // never a problem or quiz they can't yet do.
        for (Track track : tracks.findAll()) {
            assertFalse(track.getModules().isEmpty(), track.getSlug() + " has no modules");
            ModuleItem first = track.getModules().getFirst().getItems().getFirst();
            assertEquals(ModuleItem.Kind.LESSON, first.getKind(),
                    track.getSlug() + " must open with a lesson, found " + first.getKind());
        }
    }

    @Test
    void everyProblemIsWellFormed() {
        for (Problem problem : problems.findAll()) {
            assertFalse(problem.getTestCases().isEmpty(), problem.getSlug() + " has no tests");
            assertTrue(problem.getTestCases().stream().anyMatch(TestCase::isSample),
                    problem.getSlug() + " has no sample test");
            assertNotNull(problem.getEditorialMd(), problem.getSlug() + " has no editorial");
            assertFalse(problem.getStarterCode().isBlank());
        }
    }

    @Test
    void everyQuizAnswerIndexIsValid() {
        for (Quiz quiz : quizzes.findAll()) {
            assertFalse(quiz.getQuestions().isEmpty(), quiz.getSlug() + " has no questions");
            for (QuizQuestion question : quiz.getQuestions()) {
                assertTrue(question.getCorrectIndex() >= 0
                                && question.getCorrectIndex() < question.getChoices().size(),
                        quiz.getSlug() + " question " + question.getSortOrder()
                                + " answer index out of range");
                assertTrue(question.getChoices().size() >= 2);
                assertNotNull(question.getExplanationMd());
            }
        }
    }

    @Test
    void everyReferenceSolutionIsAccepted() {
        List<Problem> all = problems.findAll();
        assertFalse(all.isEmpty());
        for (Problem problem : all) {
            JudgeResult result = judge.judge(problem.getReferenceSolution(), problem.getTestCases());
            assertEquals(Verdict.ACCEPTED, result.verdict(),
                    problem.getSlug() + " reference solution not accepted: " + result.verdict()
                            + "\ncompiler: " + result.compilerOutput()
                            + "\ntests: " + result.tests().stream()
                            .map(t -> t.index() + "=" + t.verdict()).toList());
        }
    }
}
