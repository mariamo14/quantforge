package com.quantforge.content;

import com.quantforge.auth.User;
import com.quantforge.config.ApiException;
import com.quantforge.judge.Verdict;
import com.quantforge.progress.ProgressService;
import com.quantforge.progress.SubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.quantforge.content.ContentDtos.*;

@RestController
@RequestMapping("/api")
@Transactional(readOnly = true)
public class ContentController {

    private final TrackRepository tracks;
    private final LessonRepository lessons;
    private final ProblemRepository problems;
    private final QuizRepository quizzes;
    private final ProgressService progress;
    private final SubmissionRepository submissions;

    public ContentController(TrackRepository tracks, LessonRepository lessons,
                             ProblemRepository problems, QuizRepository quizzes,
                             ProgressService progress, SubmissionRepository submissions) {
        this.tracks = tracks;
        this.lessons = lessons;
        this.problems = problems;
        this.quizzes = quizzes;
        this.progress = progress;
        this.submissions = submissions;
    }

    @GetMapping("/tracks")
    public List<TrackSummary> listTracks(@AuthenticationPrincipal User user) {
        Set<Long> lessonIds = progress.completedLessonIds(user.getId());
        Set<Long> problemIds = progress.solvedProblemIds(user.getId());
        Set<Long> quizIds = progress.passedQuizIds(user.getId());
        return tracks.findAll().stream()
                .sorted(Comparator.comparingInt(Track::getSortOrder))
                .map(track -> {
                    var tp = progress.trackProgress(track, lessonIds, problemIds, quizIds);
                    return new TrackSummary(track.getSlug(), track.getTitle(), track.getIcon(),
                            track.getAccent(), track.getDescription(), tp.total(), tp.done());
                })
                .toList();
    }

    @GetMapping("/tracks/{slug}")
    public TrackDetail getTrack(@PathVariable String slug, @AuthenticationPrincipal User user) {
        Track track = tracks.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Track not found"));
        Set<Long> lessonIds = progress.completedLessonIds(user.getId());
        Set<Long> problemIds = progress.solvedProblemIds(user.getId());
        Set<Long> quizIds = progress.passedQuizIds(user.getId());

        List<ModuleDto> moduleDtos = track.getModules().stream().map(module ->
                new ModuleDto(module.getSlug(), module.getTitle(), module.getDescription(),
                        module.getItems().stream().map(item -> toItemDto(item,
                                progress.isItemDone(item, lessonIds, problemIds, quizIds))).toList())
        ).toList();
        return new TrackDetail(track.getSlug(), track.getTitle(), track.getIcon(),
                track.getAccent(), track.getDescription(), moduleDtos);
    }

    private static ItemDto toItemDto(ModuleItem item, boolean done) {
        return switch (item.getKind()) {
            case LESSON -> new ItemDto("lesson", item.getLesson().getSlug(), item.getLesson().getTitle(),
                    null, item.getLesson().getMinutes(), null, ProgressService.LESSON_XP, done);
            case PROBLEM -> new ItemDto("problem", item.getProblem().getSlug(), item.getProblem().getTitle(),
                    item.getProblem().getDifficulty().name(), null, null, item.getProblem().getXp(), done);
            case QUIZ -> new ItemDto("quiz", item.getQuiz().getSlug(), item.getQuiz().getTitle(),
                    null, null, item.getQuiz().getQuestions().size(),
                    item.getQuiz().getQuestions().size() * item.getQuiz().getXpPerCorrect(), done);
        };
    }

    @GetMapping("/lessons/{slug}")
    public LessonDto getLesson(@PathVariable String slug, @AuthenticationPrincipal User user) {
        Lesson lesson = lessons.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lesson not found"));
        boolean done = progress.completedLessonIds(user.getId()).contains(lesson.getId());
        return new LessonDto(lesson.getSlug(), lesson.getTitle(), lesson.getMinutes(),
                lesson.getMarkdown(), done);
    }

    @GetMapping("/problems/{slug}")
    public ProblemDto getProblem(@PathVariable String slug, @AuthenticationPrincipal User user) {
        Problem problem = problems.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        boolean solved = progress.solvedProblemIds(user.getId()).contains(problem.getId());
        List<SampleTestDto> sampleTests = problem.getTestCases().stream()
                .filter(TestCase::isSample)
                .map(t -> new SampleTestDto(t.getInput(), t.getExpectedOutput()))
                .toList();
        String lastCode = submissions
                .findByUserIdAndProblemIdOrderByCreatedAtDesc(user.getId(), problem.getId())
                .stream().findFirst().map(s -> s.getCode()).orElse(null);
        return new ProblemDto(problem.getSlug(), problem.getTitle(), problem.getDifficulty().name(),
                problem.getXp(), problem.getTimeLimitMs(), problem.getStatementMd(),
                problem.getStarterCode(), sampleTests, solved,
                solved ? problem.getEditorialMd() : null, lastCode);
    }

    @GetMapping("/quizzes/{slug}")
    public QuizDto getQuiz(@PathVariable String slug, @AuthenticationPrincipal User user) {
        Quiz quiz = quizzes.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found"));
        Map<Long, Integer> best = progress.bestQuizScores(user.getId());
        List<QuizQuestionDto> questions = quiz.getQuestions().stream()
                .map(q -> new QuizQuestionDto(q.getId(), q.getPromptMd(), q.getChoices()))
                .toList();
        return new QuizDto(quiz.getSlug(), quiz.getTitle(), quiz.getDescription(),
                quiz.getXpPerCorrect(), best.get(quiz.getId()), questions);
    }

    /** Deterministic daily challenge: rotates through the problem catalog by epoch day. */
    @GetMapping("/daily")
    public DailyChallengeDto daily(@AuthenticationPrincipal User user) {
        List<Problem> all = problems.findAll().stream()
                .sorted(Comparator.comparing(Problem::getSlug))
                .toList();
        if (all.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No problems available");
        }
        Problem pick = all.get((int) (LocalDate.now().toEpochDay() % all.size()));
        boolean solved = submissions.existsByUserIdAndProblemIdAndVerdict(
                user.getId(), pick.getId(), Verdict.ACCEPTED);
        return new DailyChallengeDto(pick.getSlug(), pick.getTitle(),
                pick.getDifficulty().name(), pick.getXp(), solved);
    }
}
