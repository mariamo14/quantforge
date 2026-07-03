package com.quantforge.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Loads the content/ directory (YAML + Markdown) into the database on startup.
 * Idempotent: lessons/problems/quizzes are upserted by slug (their ids — and therefore
 * user progress rows pointing at them — are preserved); track/module/item structure is
 * rebuilt from YAML each boot since nothing references it.
 */
@Component
@ConditionalOnProperty(name = "quantforge.content.enabled", havingValue = "true")
public class ContentSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ContentSeeder.class);

    // Raise SnakeYAML's default 3MB document cap — large hidden-test files exceed it.
    private final ObjectMapper yaml = createYamlMapper();

    private static ObjectMapper createYamlMapper() {
        var loaderOptions = new org.yaml.snakeyaml.LoaderOptions();
        loaderOptions.setCodePointLimit(64 * 1024 * 1024);
        return new ObjectMapper(YAMLFactory.builder().loaderOptions(loaderOptions).build());
    }
    private final Path contentDir;
    private final TrackRepository tracks;
    private final LessonRepository lessons;
    private final ProblemRepository problems;
    private final QuizRepository quizzes;

    public ContentSeeder(@Value("${quantforge.content.dir}") String contentDir,
                         TrackRepository tracks, LessonRepository lessons,
                         ProblemRepository problems, QuizRepository quizzes) {
        this.contentDir = Path.of(contentDir);
        this.tracks = tracks;
        this.lessons = lessons;
        this.problems = problems;
        this.quizzes = quizzes;
    }

    // --- YAML shapes ---

    record ItemYaml(String kind, String ref) {
    }

    record ModuleYaml(String slug, String title, String description, List<ItemYaml> items) {
    }

    record TrackYaml(String slug, String title, String icon, String accent, Integer order,
                     String description, List<ModuleYaml> modules) {
    }

    record ProblemYaml(String title, String difficulty, Integer xp, Integer timeLimitMs) {
    }

    record TestYaml(String input, String output, Boolean sample) {
    }

    record QuestionYaml(String prompt, List<String> choices, int answer, String explanation) {
    }

    record QuizYaml(String title, String description, Integer xpPerCorrect,
                    List<QuestionYaml> questions) {
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (!Files.isDirectory(contentDir)) {
            log.warn("Content directory {} not found — skipping seed", contentDir.toAbsolutePath());
            return;
        }
        seedLessons();
        seedProblems();
        seedQuizzes();
        seedTracks();
        log.info("Content seeded: {} tracks, {} lessons, {} problems, {} quizzes",
                tracks.count(), lessons.count(), problems.count(), quizzes.count());
    }

    private void seedLessons() throws IOException {
        Path dir = contentDir.resolve("lessons");
        for (Path file : listFiles(dir, ".md")) {
            String slug = stripExtension(file);
            String raw = Files.readString(file);
            Frontmatter fm = Frontmatter.parse(raw, file);
            Lesson lesson = lessons.findBySlug(slug).orElseGet(() -> new Lesson(slug));
            lesson.setTitle(fm.get("title", slug));
            lesson.setMinutes(Integer.parseInt(fm.get("minutes", "10")));
            lesson.setMarkdown(fm.body());
            lessons.save(lesson);
        }
    }

    private void seedProblems() throws IOException {
        Path dir = contentDir.resolve("problems");
        if (!Files.isDirectory(dir)) {
            return;
        }
        try (Stream<Path> children = Files.list(dir)) {
            for (Path problemDir : children.filter(Files::isDirectory).sorted().toList()) {
                seedProblem(problemDir);
            }
        }
    }

    private void seedProblem(Path dir) throws IOException {
        String slug = dir.getFileName().toString();
        ProblemYaml meta = yaml.readValue(Files.readString(dir.resolve("problem.yaml")), ProblemYaml.class);
        List<TestYaml> tests = yaml.readValue(Files.readString(dir.resolve("tests.yaml")),
                yaml.getTypeFactory().constructCollectionType(List.class, TestYaml.class));

        Problem problem = problems.findBySlug(slug).orElseGet(() -> new Problem(slug));
        problem.setTitle(meta.title());
        problem.setDifficulty(Problem.Difficulty.valueOf(meta.difficulty().toUpperCase(Locale.ROOT)));
        problem.setXp(meta.xp() != null ? meta.xp() : 100);
        problem.setTimeLimitMs(meta.timeLimitMs() != null ? meta.timeLimitMs() : 2000);
        problem.setStatementMd(Files.readString(dir.resolve("statement.md")));
        problem.setStarterCode(Files.readString(dir.resolve("starter.cpp")));
        problem.setReferenceSolution(Files.readString(dir.resolve("solution.cpp")));
        Path editorial = dir.resolve("editorial.md");
        problem.setEditorialMd(Files.exists(editorial) ? Files.readString(editorial) : null);

        problem.getTestCases().clear();
        for (int i = 0; i < tests.size(); i++) {
            TestYaml t = tests.get(i);
            problem.getTestCases().add(new TestCase(problem, i, t.input(), t.output(),
                    Boolean.TRUE.equals(t.sample())));
        }
        problems.save(problem);
    }

    private void seedQuizzes() throws IOException {
        Path dir = contentDir.resolve("quizzes");
        for (Path file : listFiles(dir, ".yaml")) {
            String slug = stripExtension(file);
            QuizYaml meta = yaml.readValue(Files.readString(file), QuizYaml.class);
            Quiz quiz = quizzes.findBySlug(slug).orElseGet(() -> new Quiz(slug));
            quiz.setTitle(meta.title());
            quiz.setDescription(meta.description());
            if (meta.xpPerCorrect() != null) {
                quiz.setXpPerCorrect(meta.xpPerCorrect());
            }
            quiz.getQuestions().clear();
            List<QuestionYaml> questions = meta.questions();
            for (int i = 0; i < questions.size(); i++) {
                QuestionYaml q = questions.get(i);
                quiz.getQuestions().add(new QuizQuestion(quiz, i, q.prompt(), q.choices(),
                        q.answer(), q.explanation()));
            }
            quizzes.save(quiz);
        }
    }

    private void seedTracks() throws IOException {
        Path dir = contentDir.resolve("tracks");
        for (Path file : listFiles(dir, ".yaml")) {
            TrackYaml meta = yaml.readValue(Files.readString(file), TrackYaml.class);
            Track track = tracks.findBySlug(meta.slug()).orElseGet(() -> new Track(meta.slug()));
            track.setTitle(meta.title());
            track.setIcon(meta.icon());
            track.setAccent(meta.accent());
            track.setSortOrder(meta.order() != null ? meta.order() : 0);
            track.setDescription(meta.description());
            track.getModules().clear();

            int moduleOrder = 0;
            for (ModuleYaml m : meta.modules()) {
                TrackModule module = new TrackModule(track, m.slug(), m.title(), m.description(),
                        moduleOrder++);
                int itemOrder = 0;
                for (ItemYaml item : m.items()) {
                    switch (item.kind()) {
                        case "lesson" -> module.getItems().add(ModuleItem.lesson(module,
                                lessons.findBySlug(item.ref()).orElseThrow(missing(item)), itemOrder++));
                        case "problem" -> module.getItems().add(ModuleItem.problem(module,
                                problems.findBySlug(item.ref()).orElseThrow(missing(item)), itemOrder++));
                        case "quiz" -> module.getItems().add(ModuleItem.quiz(module,
                                quizzes.findBySlug(item.ref()).orElseThrow(missing(item)), itemOrder++));
                        default -> throw new IllegalStateException("Unknown item kind: " + item.kind());
                    }
                }
                track.getModules().add(module);
            }
            tracks.save(track);
        }
    }

    private static java.util.function.Supplier<IllegalStateException> missing(ItemYaml item) {
        return () -> new IllegalStateException(
                "Track references missing " + item.kind() + ": " + item.ref());
    }

    private static List<Path> listFiles(Path dir, String extension) throws IOException {
        if (!Files.isDirectory(dir)) {
            return List.of();
        }
        try (Stream<Path> children = Files.list(dir)) {
            return children.filter(p -> p.getFileName().toString().endsWith(extension))
                    .sorted().toList();
        }
    }

    private static String stripExtension(Path file) {
        String name = file.getFileName().toString();
        return name.substring(0, name.lastIndexOf('.'));
    }

    /** Minimal ---key: value--- frontmatter parser for lesson files. */
    record Frontmatter(Map<String, String> values, String body) {

        static Frontmatter parse(String raw, Path file) {
            if (!raw.startsWith("---")) {
                throw new IllegalStateException("Lesson missing frontmatter: " + file);
            }
            int end = raw.indexOf("\n---", 3);
            if (end < 0) {
                throw new IllegalStateException("Unterminated frontmatter: " + file);
            }
            String header = raw.substring(3, end);
            String body = raw.substring(raw.indexOf('\n', end + 1) + 1);
            Map<String, String> values = new java.util.HashMap<>();
            for (String line : header.split("\n")) {
                int colon = line.indexOf(':');
                if (colon > 0) {
                    values.put(line.substring(0, colon).trim(),
                            line.substring(colon + 1).trim().replaceAll("^\"|\"$", ""));
                }
            }
            return new Frontmatter(values, body.strip() + "\n");
        }

        String get(String key, String fallback) {
            return values.getOrDefault(key, fallback);
        }
    }
}
