package com.quantforge.progress;

import com.quantforge.content.ModuleItem;
import com.quantforge.content.Quiz;
import com.quantforge.content.Track;
import com.quantforge.judge.Verdict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProgressService {

    public static final int LESSON_XP = 25;
    public static final double QUIZ_PASS_RATIO = 0.7;

    private final SubmissionRepository submissions;
    private final LessonCompletionRepository completions;
    private final QuizAttemptRepository attempts;

    public ProgressService(SubmissionRepository submissions, LessonCompletionRepository completions,
                           QuizAttemptRepository attempts) {
        this.submissions = submissions;
        this.completions = completions;
        this.attempts = attempts;
    }

    public Set<Long> completedLessonIds(Long userId) {
        return completions.findByUserId(userId).stream()
                .map(c -> c.getLesson().getId())
                .collect(Collectors.toSet());
    }

    public Set<Long> solvedProblemIds(Long userId) {
        return submissions.findByUserIdAndVerdict(userId, Verdict.ACCEPTED).stream()
                .map(s -> s.getProblem().getId())
                .collect(Collectors.toSet());
    }

    /** Best score per quiz id. */
    public Map<Long, Integer> bestQuizScores(Long userId) {
        Map<Long, Integer> best = new HashMap<>();
        for (QuizAttempt attempt : attempts.findByUserId(userId)) {
            best.merge(attempt.getQuiz().getId(), attempt.getScore(), Math::max);
        }
        return best;
    }

    public Set<Long> passedQuizIds(Long userId) {
        Set<Long> passed = new HashSet<>();
        for (QuizAttempt attempt : attempts.findByUserId(userId)) {
            if (attempt.getTotal() > 0
                    && attempt.getScore() >= Math.ceil(attempt.getTotal() * QUIZ_PASS_RATIO)) {
                passed.add(attempt.getQuiz().getId());
            }
        }
        return passed;
    }

    public boolean isItemDone(ModuleItem item, Set<Long> lessonIds, Set<Long> problemIds, Set<Long> quizIds) {
        return switch (item.getKind()) {
            case LESSON -> lessonIds.contains(item.getLesson().getId());
            case PROBLEM -> problemIds.contains(item.getProblem().getId());
            case QUIZ -> quizIds.contains(item.getQuiz().getId());
        };
    }

    /** Total XP, always derived from activity so it can never drift out of sync. */
    public int totalXp(Long userId) {
        int lessonXp = completions.findByUserId(userId).size() * LESSON_XP;

        Map<Long, Integer> problemXp = new HashMap<>();
        for (Submission submission : submissions.findByUserIdAndVerdict(userId, Verdict.ACCEPTED)) {
            problemXp.putIfAbsent(submission.getProblem().getId(), submission.getProblem().getXp());
        }
        int solvedXp = problemXp.values().stream().mapToInt(Integer::intValue).sum();

        Map<Long, Integer> bestScores = new HashMap<>();
        Map<Long, Quiz> quizzes = new HashMap<>();
        for (QuizAttempt attempt : attempts.findByUserId(userId)) {
            bestScores.merge(attempt.getQuiz().getId(), attempt.getScore(), Math::max);
            quizzes.putIfAbsent(attempt.getQuiz().getId(), attempt.getQuiz());
        }
        int quizXp = bestScores.entrySet().stream()
                .mapToInt(e -> e.getValue() * quizzes.get(e.getKey()).getXpPerCorrect())
                .sum();

        return lessonXp + solvedXp + quizXp;
    }

    /** Level thresholds are quadratic: level n starts at (n-1)^2 * 100 XP. */
    public static int levelForXp(int xp) {
        return 1 + (int) Math.floor(Math.sqrt(xp / 100.0));
    }

    public static int xpAtLevelStart(int level) {
        return (level - 1) * (level - 1) * 100;
    }

    /** Consecutive active days ending today or yesterday. */
    public int streakDays(Long userId) {
        ZoneId zone = ZoneId.systemDefault();
        Set<LocalDate> activeDays = new HashSet<>();
        submissions.findByUserId(userId).forEach(s -> activeDays.add(toDate(s.getCreatedAt(), zone)));
        completions.findByUserId(userId).forEach(c -> activeDays.add(toDate(c.getCompletedAt(), zone)));
        attempts.findByUserId(userId).forEach(a -> activeDays.add(toDate(a.getCreatedAt(), zone)));

        LocalDate today = LocalDate.now(zone);
        LocalDate cursor = activeDays.contains(today) ? today
                : activeDays.contains(today.minusDays(1)) ? today.minusDays(1)
                : null;
        int streak = 0;
        while (cursor != null && activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    public record TrackProgress(String slug, String title, String icon, String accent, int done, int total) {
    }

    public TrackProgress trackProgress(Track track, Set<Long> lessonIds, Set<Long> problemIds,
                                       Set<Long> quizIds) {
        int total = 0;
        int done = 0;
        for (var module : track.getModules()) {
            for (ModuleItem item : module.getItems()) {
                total++;
                if (isItemDone(item, lessonIds, problemIds, quizIds)) {
                    done++;
                }
            }
        }
        return new TrackProgress(track.getSlug(), track.getTitle(), track.getIcon(),
                track.getAccent(), done, total);
    }

    private static LocalDate toDate(Instant instant, ZoneId zone) {
        return instant.atZone(zone).toLocalDate();
    }
}
