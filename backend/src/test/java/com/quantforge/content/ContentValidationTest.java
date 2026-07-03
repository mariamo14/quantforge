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
        assertEquals(5, tracks.count(), "tracks");
        assertTrue(lessons.count() >= 24, "expected at least 24 lessons, got " + lessons.count());
        assertEquals(12, problems.count(), "problems");
        assertTrue(quizzes.count() >= 9, "quizzes");
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
