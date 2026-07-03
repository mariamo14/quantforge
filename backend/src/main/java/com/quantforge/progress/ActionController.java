package com.quantforge.progress;

import com.quantforge.auth.User;
import com.quantforge.config.ApiException;
import com.quantforge.content.*;
import com.quantforge.judge.JudgeResult;
import com.quantforge.judge.JudgeService;
import com.quantforge.judge.Verdict;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ActionController {

    public record CodeRequest(@NotBlank @Size(max = 100_000) String code) {
    }

    public record RunResponse(Verdict verdict, String compilerOutput,
                              List<JudgeResult.TestResult> tests, long maxTimeMs,
                              int passed, int total, int xpAwarded, boolean firstAccept) {
    }

    public record QuizSubmitRequest(@NotNull List<Long> questionIds, @NotNull List<Integer> answers) {
    }

    public record QuizQuestionResult(Long questionId, int correctIndex, boolean correct, String explanationMd) {
    }

    public record QuizResultResponse(int score, int total, int xpAwarded, boolean passed,
                                     List<QuizQuestionResult> results) {
    }

    public record LessonCompleteResponse(boolean done, int xpAwarded) {
    }

    private final ProblemRepository problems;
    private final LessonRepository lessons;
    private final QuizRepository quizzes;
    private final JudgeService judgeService;
    private final SubmissionRepository submissions;
    private final LessonCompletionRepository completions;
    private final QuizAttemptRepository attempts;
    private final ProgressService progress;

    public ActionController(ProblemRepository problems, LessonRepository lessons, QuizRepository quizzes,
                            JudgeService judgeService, SubmissionRepository submissions,
                            LessonCompletionRepository completions, QuizAttemptRepository attempts,
                            ProgressService progress) {
        this.problems = problems;
        this.lessons = lessons;
        this.quizzes = quizzes;
        this.judgeService = judgeService;
        this.submissions = submissions;
        this.completions = completions;
        this.attempts = attempts;
        this.progress = progress;
    }

    /** Run against sample tests only; nothing is recorded. */
    @PostMapping("/problems/{slug}/run")
    @Transactional(readOnly = true)
    public RunResponse run(@PathVariable String slug, @Valid @RequestBody CodeRequest request) {
        Problem problem = findProblem(slug);
        List<TestCase> sampleTests = problem.getTestCases().stream()
                .filter(TestCase::isSample).toList();
        JudgeResult result = judgeService.judge(request.code(), sampleTests);
        return new RunResponse(result.verdict(), result.compilerOutput(), result.tests(),
                result.maxTimeMs(), (int) result.passedCount(), sampleTests.size(), 0, false);
    }

    /** Run against the full test set and record the submission. */
    @PostMapping("/problems/{slug}/submit")
    @Transactional
    public RunResponse submit(@PathVariable String slug, @Valid @RequestBody CodeRequest request,
                              @AuthenticationPrincipal User user) {
        Problem problem = findProblem(slug);
        List<TestCase> allTests = problem.getTestCases();
        boolean solvedBefore = submissions.existsByUserIdAndProblemIdAndVerdict(
                user.getId(), problem.getId(), Verdict.ACCEPTED);

        JudgeResult result = judgeService.judge(request.code(), allTests);
        submissions.save(new Submission(user, problem, request.code(), result.verdict(),
                (int) result.passedCount(), allTests.size(), result.maxTimeMs()));

        boolean firstAccept = result.verdict() == Verdict.ACCEPTED && !solvedBefore;
        int xpAwarded = firstAccept ? problem.getXp() : 0;
        return new RunResponse(result.verdict(), result.compilerOutput(), result.tests(),
                result.maxTimeMs(), (int) result.passedCount(), allTests.size(), xpAwarded, firstAccept);
    }

    @PostMapping("/lessons/{slug}/complete")
    @Transactional
    public LessonCompleteResponse completeLesson(@PathVariable String slug,
                                                 @AuthenticationPrincipal User user) {
        Lesson lesson = lessons.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lesson not found"));
        boolean alreadyDone = completions.findByUserIdAndLessonId(user.getId(), lesson.getId()).isPresent();
        if (!alreadyDone) {
            completions.save(new LessonCompletion(user, lesson));
        }
        return new LessonCompleteResponse(true, alreadyDone ? 0 : ProgressService.LESSON_XP);
    }

    public record QuizCheckRequest(@NotNull Long questionId, @NotNull Integer answer) {
    }

    public record QuizCheckResponse(boolean correct, int correctIndex, String explanationMd) {
    }

    /** Instant per-question feedback (CodeSignal-style). Nothing is recorded. */
    @PostMapping("/quizzes/{slug}/check")
    @Transactional(readOnly = true)
    public QuizCheckResponse checkAnswer(@PathVariable String slug,
                                         @Valid @RequestBody QuizCheckRequest request) {
        Quiz quiz = quizzes.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found"));
        QuizQuestion question = quiz.getQuestions().stream()
                .filter(q -> q.getId().equals(request.questionId()))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
        return new QuizCheckResponse(request.answer() == question.getCorrectIndex(),
                question.getCorrectIndex(), question.getExplanationMd());
    }

    @PostMapping("/quizzes/{slug}/submit")
    @Transactional
    public QuizResultResponse submitQuiz(@PathVariable String slug,
                                         @Valid @RequestBody QuizSubmitRequest request,
                                         @AuthenticationPrincipal User user) {
        Quiz quiz = quizzes.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found"));
        if (request.questionIds().size() != request.answers().size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "questionIds and answers must align");
        }

        int previousBest = attempts.findByUserIdAndQuizId(user.getId(), quiz.getId()).stream()
                .mapToInt(QuizAttempt::getScore).max().orElse(0);

        int score = 0;
        List<QuizQuestionResult> results = new ArrayList<>();
        for (QuizQuestion question : quiz.getQuestions()) {
            int idx = request.questionIds().indexOf(question.getId());
            int answer = idx >= 0 ? request.answers().get(idx) : -1;
            boolean correct = answer == question.getCorrectIndex();
            if (correct) {
                score++;
            }
            results.add(new QuizQuestionResult(question.getId(), question.getCorrectIndex(),
                    correct, question.getExplanationMd()));
        }
        int total = quiz.getQuestions().size();
        attempts.save(new QuizAttempt(user, quiz, score, total));

        // XP only for improvement over the previous best, so retakes can't farm points.
        int xpAwarded = Math.max(0, score - previousBest) * quiz.getXpPerCorrect();
        boolean passed = total > 0 && score >= Math.ceil(total * ProgressService.QUIZ_PASS_RATIO);
        return new QuizResultResponse(score, total, xpAwarded, passed, results);
    }

    private Problem findProblem(String slug) {
        return problems.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
    }
}
