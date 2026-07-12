package com.quantforge.judge;

import com.quantforge.content.Problem;
import com.quantforge.content.TestCase;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests that invoke the real clang++ toolchain — the same path
 * user submissions take. No Spring context needed.
 */
class JudgeServiceTest {

    private static JudgeService judge;
    private static Problem problem;

    @BeforeAll
    static void setUp() {
        judge = new JudgeService("clang++", 20_000, 262_144, 2, true);
        problem = new Problem("test-problem");
        problem.setTimeLimitMs(2000);
    }

    @Test
    void sandboxBlocksNetworkAndForeignWrites() {
        org.junit.jupiter.api.Assumptions.assumeTrue(
                java.nio.file.Files.isExecutable(java.nio.file.Path.of("/usr/bin/sandbox-exec")),
                "sandbox-exec not available on this host");
        // seatbelt gates connect() and writes, not bare socket() creation — probe those
        String probe = """
                #include <sys/socket.h>
                #include <netinet/in.h>
                #include <arpa/inet.h>
                #include <fcntl.h>
                #include <cerrno>
                #include <cstdio>
                int main() {
                    int fd = socket(AF_INET, SOCK_STREAM, 0);
                    fcntl(fd, F_SETFL, O_NONBLOCK);
                    sockaddr_in addr{};
                    addr.sin_family = AF_INET;
                    addr.sin_port = htons(80);
                    inet_pton(AF_INET, "1.1.1.1", &addr.sin_addr);
                    int r = connect(fd, (sockaddr*)&addr, sizeof(addr));
                    // unsandboxed non-blocking connect yields EINPROGRESS; sandbox => EPERM
                    std::puts(r != 0 && errno != EINPROGRESS ? "CONNECT_BLOCKED" : "CONNECT_OPEN");
                    FILE* f = std::fopen("/tmp/qf-sandbox-escape.txt", "w");
                    std::puts(f == nullptr ? "WRITE_BLOCKED" : "WRITE_OPEN");
                    if (f) std::fclose(f);
                    return 0;
                }
                """;
        JudgeResult result = judge.judge(probe, tests("", "CONNECT_BLOCKED\nWRITE_BLOCKED\n"));
        assertEquals(Verdict.ACCEPTED, result.verdict(),
                "sandbox must deny sockets and writes outside the work dir; got: "
                        + result.tests().getFirst().actual());
    }

    private static List<TestCase> tests(String... inputOutputPairs) {
        assertEquals(0, inputOutputPairs.length % 2);
        java.util.List<TestCase> result = new java.util.ArrayList<>();
        for (int i = 0; i < inputOutputPairs.length; i += 2) {
            result.add(new TestCase(problem, i / 2, inputOutputPairs[i], inputOutputPairs[i + 1], true));
        }
        return result;
    }

    private static final String ECHO_SUM = """
            #include <iostream>
            int main() {
                long long a, b;
                std::cin >> a >> b;
                std::cout << a + b << "\\n";
                return 0;
            }
            """;

    @Test
    void acceptsCorrectSolution() {
        JudgeResult result = judge.judge(ECHO_SUM, tests("2 3\n", "5\n", "10 -4\n", "6\n"));
        assertEquals(Verdict.ACCEPTED, result.verdict());
        assertEquals(2, result.passedCount());
        assertTrue(result.tests().stream().allMatch(t -> t.verdict() == Verdict.ACCEPTED));
    }

    @Test
    void flagsWrongAnswer() {
        String wrong = ECHO_SUM.replace("a + b", "a - b");
        JudgeResult result = judge.judge(wrong, tests("2 3\n", "5\n"));
        assertEquals(Verdict.WRONG_ANSWER, result.verdict());
        assertEquals("5", result.tests().getFirst().expected().trim());
        assertEquals("-1", result.tests().getFirst().actual().trim());
    }

    @Test
    void flagsCompileError() {
        JudgeResult result = judge.judge("int main() { return 0 }", tests("", ""));
        assertEquals(Verdict.COMPILE_ERROR, result.verdict());
        assertTrue(result.compilerOutput().contains("error"));
    }

    @Test
    void flagsTimeLimit() {
        String loop = """
                int main() {
                    volatile long long x = 0;
                    while (true) { x++; }
                    return 0;
                }
                """;
        JudgeResult result = judge.judge(loop, tests("", ""));
        assertEquals(Verdict.TIME_LIMIT, result.verdict());
    }

    @Test
    void flagsRuntimeError() {
        String crash = """
                #include <cstdlib>
                int main() { std::abort(); }
                """;
        JudgeResult result = judge.judge(crash, tests("", ""));
        assertEquals(Verdict.RUNTIME_ERROR, result.verdict());
    }

    @Test
    void ignoresTrailingWhitespaceInComparison() {
        assertTrue(JudgeService.outputsMatch("5\n", "5"));
        assertTrue(JudgeService.outputsMatch("a b \n\n", "a b\n"));
        assertFalse(JudgeService.outputsMatch("5\n6\n", "5\n"));
    }

    @Test
    void capsRunawayOutput() {
        String spam = """
                #include <cstdio>
                int main() {
                    for (int i = 0; i < 100000000; i++) puts("spam");
                    return 0;
                }
                """;
        JudgeResult result = judge.judge(spam, tests("", "expected\n"));
        // must terminate (via time limit) rather than OOM-ing the JVM on unbounded output
        assertNotEquals(Verdict.ACCEPTED, result.verdict());
        result.tests().stream()
                .filter(t -> t.actual() != null)
                .forEach(t -> assertTrue(t.actual().length() <= 300_000));
    }
}
