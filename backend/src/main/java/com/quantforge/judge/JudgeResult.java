package com.quantforge.judge;

import java.util.List;

/**
 * Outcome of judging one submission against a set of test cases.
 *
 * @param verdict        overall verdict (worst verdict across tests; ACCEPTED only if all pass)
 * @param compilerOutput compiler stderr — populated on COMPILE_ERROR, may carry warnings otherwise
 * @param tests          per-test results, in test order
 * @param maxTimeMs      slowest passing/failing run, for display
 */
public record JudgeResult(Verdict verdict, String compilerOutput, List<TestResult> tests, long maxTimeMs) {

    /**
     * @param expected expected output — only populated for sample tests so hidden tests stay hidden
     * @param actual   actual (possibly truncated) stdout — only populated for sample tests
     */
    public record TestResult(int index, boolean sample, Verdict verdict, long timeMs,
                             String expected, String actual, String stderr) {
    }

    public static JudgeResult compileError(String compilerOutput) {
        return new JudgeResult(Verdict.COMPILE_ERROR, compilerOutput, List.of(), 0);
    }

    public long passedCount() {
        return tests.stream().filter(t -> t.verdict() == Verdict.ACCEPTED).count();
    }
}
