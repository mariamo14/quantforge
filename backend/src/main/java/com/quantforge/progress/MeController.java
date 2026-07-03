package com.quantforge.progress;

import com.quantforge.auth.AuthDtos.UserDto;
import com.quantforge.auth.User;
import com.quantforge.content.Track;
import com.quantforge.content.TrackRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/me")
@Transactional(readOnly = true)
public class MeController {

    public record MeResponse(UserDto user, int xp, int level, int xpIntoLevel, int xpForNextLevel,
                             int streakDays, int solvedProblems, int completedLessons, int passedQuizzes,
                             List<ProgressService.TrackProgress> tracks) {
    }

    public record SubmissionSummary(Long id, String problemSlug, String problemTitle, String verdict,
                                    int passedCount, int totalCount, long maxTimeMs, Instant createdAt) {
    }

    private final ProgressService progress;
    private final TrackRepository tracks;
    private final SubmissionRepository submissions;

    public MeController(ProgressService progress, TrackRepository tracks,
                        SubmissionRepository submissions) {
        this.progress = progress;
        this.tracks = tracks;
        this.submissions = submissions;
    }

    @GetMapping
    public MeResponse me(@AuthenticationPrincipal User user) {
        Set<Long> lessonIds = progress.completedLessonIds(user.getId());
        Set<Long> problemIds = progress.solvedProblemIds(user.getId());
        Set<Long> quizIds = progress.passedQuizIds(user.getId());

        int xp = progress.totalXp(user.getId());
        int level = ProgressService.levelForXp(xp);
        int levelStart = ProgressService.xpAtLevelStart(level);
        int nextLevelStart = ProgressService.xpAtLevelStart(level + 1);

        List<ProgressService.TrackProgress> trackProgress = tracks.findAll().stream()
                .sorted(Comparator.comparingInt(Track::getSortOrder))
                .map(track -> progress.trackProgress(track, lessonIds, problemIds, quizIds))
                .toList();

        return new MeResponse(UserDto.from(user), xp, level, xp - levelStart,
                nextLevelStart - levelStart, progress.streakDays(user.getId()),
                problemIds.size(), lessonIds.size(), quizIds.size(), trackProgress);
    }

    @GetMapping("/submissions")
    public List<SubmissionSummary> submissions(@AuthenticationPrincipal User user) {
        return submissions.findTop50ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(s -> new SubmissionSummary(s.getId(), s.getProblem().getSlug(),
                        s.getProblem().getTitle(), s.getVerdict().name(), s.getPassedCount(),
                        s.getTotalCount(), s.getMaxTimeMs(), s.getCreatedAt()))
                .toList();
    }
}
