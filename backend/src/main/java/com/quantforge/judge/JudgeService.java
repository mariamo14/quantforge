package com.quantforge.judge;

import com.quantforge.content.TestCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * Compiles and runs C++ submissions locally with clang++.
 *
 * Safety model (documented in the README): submissions run as local subprocesses with
 * wall-clock timeouts, forced kill, and output caps — but no filesystem/network jail.
 * That is an accepted trade-off for a personal, locally-run tool; harden with a
 * container sandbox before ever exposing this to other people's code.
 */
@Service
public class JudgeService {

    private static final Logger log = LoggerFactory.getLogger(JudgeService.class);

    private static final String SANDBOX_EXEC = "/usr/bin/sandbox-exec";

    private final String compiler;
    private final long compileTimeoutMs;
    private final int maxOutputBytes;
    private final Semaphore slots;
    private final boolean sandboxAvailable;

    public JudgeService(
            @Value("${quantforge.judge.compiler}") String compiler,
            @Value("${quantforge.judge.compile-timeout-ms}") long compileTimeoutMs,
            @Value("${quantforge.judge.max-output-bytes}") int maxOutputBytes,
            @Value("${quantforge.judge.max-concurrent}") int maxConcurrent,
            @Value("${quantforge.judge.sandbox:true}") boolean sandboxEnabled) {
        this.compiler = compiler;
        this.compileTimeoutMs = compileTimeoutMs;
        this.maxOutputBytes = maxOutputBytes;
        this.slots = new Semaphore(maxConcurrent, true);
        this.sandboxAvailable = sandboxEnabled && Files.isExecutable(Path.of(SANDBOX_EXEC));
        if (sandboxEnabled && !sandboxAvailable) {
            log.warn("Judge sandbox requested but {} not found — submissions run unsandboxed",
                    SANDBOX_EXEC);
        } else if (sandboxAvailable) {
            log.info("Judge sandbox active: network denied, writes confined to the work directory");
        }
    }

    /** Sandbox profile: no network, file writes only inside the submission's temp dir. */
    private static String sandboxProfile(Path workDir) {
        return "(version 1)\n"
                + "(allow default)\n"
                + "(deny network*)\n"
                + "(deny file-write*)\n"
                + "(allow file-write* (subpath \"" + workDir.toAbsolutePath() + "\"))\n"
                + "(allow file-write* (subpath \"/dev\"))\n";
    }

    private ProcessBuilder submissionRunner(Path workDir, Path binary) {
        if (sandboxAvailable) {
            return new ProcessBuilder(SANDBOX_EXEC, "-p", sandboxProfile(workDir),
                    binary.toString()).directory(workDir.toFile());
        }
        return new ProcessBuilder(binary.toString()).directory(workDir.toFile());
    }

    public JudgeResult judge(String sourceCode, List<TestCase> testCases) {
        try {
            slots.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new JudgeResult(Verdict.JUDGE_ERROR, "Judge interrupted", List.of(), 0);
        }
        Path workDir = null;
        try {
            workDir = Files.createTempDirectory("qf-judge-");
            return judgeInDir(workDir, sourceCode, testCases);
        } catch (IOException e) {
            log.error("Judge I/O failure", e);
            return new JudgeResult(Verdict.JUDGE_ERROR, "Judge failed: " + e.getMessage(), List.of(), 0);
        } finally {
            slots.release();
            if (workDir != null) {
                deleteRecursively(workDir);
            }
        }
    }

    private JudgeResult judgeInDir(Path workDir, String sourceCode, List<TestCase> testCases)
            throws IOException {
        Path source = workDir.resolve("main.cpp");
        Path binary = workDir.resolve("sol");
        Files.writeString(source, sourceCode, StandardCharsets.UTF_8);

        ProcessResult compile = run(
                new ProcessBuilder(compiler, "-std=c++20", "-O2", "-o", binary.toString(), source.toString())
                        .directory(workDir.toFile()),
                null, compileTimeoutMs);
        if (compile.timedOut()) {
            return JudgeResult.compileError("Compilation timed out after " + compileTimeoutMs + " ms");
        }
        if (compile.exitCode() != 0) {
            return JudgeResult.compileError(compile.stderr());
        }

        List<JudgeResult.TestResult> results = new ArrayList<>();
        Verdict overall = Verdict.ACCEPTED;
        long maxTimeMs = 0;
        for (int i = 0; i < testCases.size(); i++) {
            TestCase testCase = testCases.get(i);
            JudgeResult.TestResult result = runTest(workDir, binary, testCase, i);
            results.add(result);
            maxTimeMs = Math.max(maxTimeMs, result.timeMs());
            if (result.verdict() != Verdict.ACCEPTED && overall == Verdict.ACCEPTED) {
                overall = result.verdict();
            }
        }
        return new JudgeResult(overall, compile.stderr(), results, maxTimeMs);
    }

    private JudgeResult.TestResult runTest(Path workDir, Path binary, TestCase testCase, int index)
            throws IOException {
        long timeLimitMs = testCase.getProblem().getTimeLimitMs();
        long start = System.nanoTime();
        ProcessResult run = run(submissionRunner(workDir, binary), testCase.getInput(), timeLimitMs);
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;

        boolean sample = testCase.isSample();
        String expectedForDto = sample ? testCase.getExpectedOutput() : null;
        String actualForDto = sample ? run.stdout() : null;
        String stderrForDto = sample ? truncate(run.stderr(), 4000) : null;

        Verdict verdict;
        if (run.timedOut()) {
            verdict = Verdict.TIME_LIMIT;
            elapsedMs = timeLimitMs;
        } else if (run.exitCode() != 0) {
            verdict = Verdict.RUNTIME_ERROR;
            stderrForDto = truncate(run.stderr(), 4000);
        } else if (outputsMatch(testCase.getExpectedOutput(), run.stdout())) {
            verdict = Verdict.ACCEPTED;
        } else {
            verdict = Verdict.WRONG_ANSWER;
        }
        return new JudgeResult.TestResult(index, sample, verdict, elapsedMs,
                expectedForDto, actualForDto, stderrForDto);
    }

    /** Line-by-line comparison ignoring trailing whitespace on each line and trailing blank lines. */
    static boolean outputsMatch(String expected, String actual) {
        List<String> expectedLines = normalize(expected);
        List<String> actualLines = normalize(actual);
        return expectedLines.equals(actualLines);
    }

    private static List<String> normalize(String text) {
        List<String> lines = new ArrayList<>();
        for (String line : text.replace("\r\n", "\n").split("\n", -1)) {
            lines.add(line.stripTrailing());
        }
        while (!lines.isEmpty() && lines.getLast().isEmpty()) {
            lines.removeLast();
        }
        return lines;
    }

    private record ProcessResult(int exitCode, String stdout, String stderr, boolean timedOut) {
    }

    private ProcessResult run(ProcessBuilder builder, String stdin, long timeoutMs) throws IOException {
        Process process = builder.start();
        try {
            if (stdin != null) {
                try (var out = process.getOutputStream()) {
                    out.write(stdin.getBytes(StandardCharsets.UTF_8));
                } catch (IOException ignored) {
                    // process may exit without reading all input — not an error
                }
            } else {
                process.getOutputStream().close();
            }

            // Read output on separate threads so a chatty process can't fill the pipe and deadlock.
            var stdoutFuture = readLimitedAsync(process.getInputStream());
            var stderrFuture = readLimitedAsync(process.getErrorStream());

            boolean finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                process.waitFor(2, TimeUnit.SECONDS);
                return new ProcessResult(-1, stdoutFuture.join(), stderrFuture.join(), true);
            }
            return new ProcessResult(process.exitValue(), stdoutFuture.join(), stderrFuture.join(), false);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            throw new IOException("Interrupted while running submission", e);
        } finally {
            process.destroyForcibly();
        }
    }

    private java.util.concurrent.CompletableFuture<String> readLimitedAsync(InputStream stream) {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            try (stream) {
                byte[] buffer = new byte[8192];
                var collected = new java.io.ByteArrayOutputStream();
                int read;
                while ((read = stream.read(buffer)) != -1) {
                    if (collected.size() < maxOutputBytes) {
                        collected.write(buffer, 0, (int) Math.min(read, maxOutputBytes - collected.size()));
                    }
                    // keep draining even past the cap so the process can't block on a full pipe
                }
                return collected.toString(StandardCharsets.UTF_8);
            } catch (IOException e) {
                return "";
            }
        });
    }

    private static String truncate(String text, int maxChars) {
        if (text == null || text.length() <= maxChars) {
            return text;
        }
        return text.substring(0, maxChars) + "\n… (truncated)";
    }

    private static void deleteRecursively(Path dir) {
        try (var paths = Files.walk(dir)) {
            paths.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                }
            });
        } catch (IOException ignored) {
        }
    }
}
