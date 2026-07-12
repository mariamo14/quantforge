package com.quantforge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Brute-force protection on the auth endpoints: at most {@value #LIMIT} attempts
 * per client IP per {@value #WINDOW_MS}-ms window. In-memory fixed window — the
 * right weight for a single-node deployment (move to a shared store if this ever
 * runs behind a load balancer).
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    static final int LIMIT = 15;
    static final long WINDOW_MS = 60_000;

    private record Window(long startMs, AtomicInteger count) {
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String ip = clientIp(request);
        long now = System.currentTimeMillis();

        Window window = windows.compute(ip, (key, existing) ->
                existing == null || now - existing.startMs() >= WINDOW_MS
                        ? new Window(now, new AtomicInteger(0))
                        : existing);

        if (window.count().incrementAndGet() > LIMIT) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Too many attempts — try again in a minute\"}");
            return;
        }

        // opportunistic cleanup so the map can't grow without bound
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().startMs() >= WINDOW_MS);
        }
        chain.doFilter(request, response);
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
