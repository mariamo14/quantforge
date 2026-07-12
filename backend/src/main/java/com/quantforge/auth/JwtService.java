package com.quantforge.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey key;
    private final long ttlMillis;

    private static final String DEV_SECRET_MARKER = "change-me";

    public JwtService(
            @Value("${quantforge.jwt.secret}") String secret,
            @Value("${quantforge.jwt.ttl-hours}") long ttlHours,
            Environment environment) {
        boolean prod = java.util.Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (prod && secret.contains(DEV_SECRET_MARKER)) {
            throw new IllegalStateException(
                    "Refusing to start with the default JWT secret in the prod profile — "
                            + "set QUANTFORGE_JWT_SECRET to a long random value");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMillis = ttlHours * 3_600_000L;
    }

    public String issue(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(ttlMillis)))
                .signWith(key)
                .compact();
    }

    /** Returns the user id if the token is valid, empty otherwise. */
    public Optional<Long> verify(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload();
            return Optional.of(Long.parseLong(claims.getSubject()));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
