package com.example.demo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.auth.UnauthorizedException;
import com.example.demo.dto.AuthResponse;
import com.example.demo.model.AuthSession;
import com.example.demo.model.User;
import com.example.demo.repository.AuthSessionRepository;
import com.example.demo.repository.TasteProfileRepository;

@Service
public class SessionAuthService {

    private final AuthSessionRepository authSessionRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long sessionDays;

    public SessionAuthService(
            AuthSessionRepository authSessionRepository,
            TasteProfileRepository tasteProfileRepository,
            @Value("${app.auth.session-days:7}") long sessionDays) {
        this.authSessionRepository = authSessionRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.sessionDays = sessionDays;
    }

    public AuthResponse createAuthResponse(User user) {
        revokeActiveSessions(user);

        String rawToken = generateToken();
        LocalDateTime now = LocalDateTime.now();

        AuthSession authSession = new AuthSession();
        authSession.setUser(user);
        authSession.setTokenHash(hashToken(rawToken));
        authSession.setCreatedAt(now);
        authSession.setExpiresAt(now.plusDays(sessionDays));

        AuthSession savedSession = authSessionRepository.save(authSession);
        boolean hasTasteProfile = tasteProfileRepository.findByUser(user) != null;

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                rawToken,
                savedSession.getExpiresAt(),
                hasTasteProfile);
    }

    public AuthSession authenticate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }

        AuthSession authSession = authSessionRepository.findByTokenHashAndRevokedAtIsNull(hashToken(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));

        if (authSession.getExpiresAt() != null && authSession.getExpiresAt().isBefore(LocalDateTime.now())) {
            authSession.setRevokedAt(LocalDateTime.now());
            authSessionRepository.save(authSession);
            throw new UnauthorizedException("Session expired. Please sign in again");
        }

        return authSession;
    }

    public void revokeSession(AuthSession authSession) {
        if (authSession == null || authSession.getRevokedAt() != null) {
            return;
        }
        authSession.setRevokedAt(LocalDateTime.now());
        authSessionRepository.save(authSession);
    }

    private void revokeActiveSessions(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<AuthSession> activeSessions = authSessionRepository.findByUserAndRevokedAtIsNull(user);
        for (AuthSession activeSession : activeSessions) {
            activeSession.setRevokedAt(now);
        }
        if (!activeSessions.isEmpty()) {
            authSessionRepository.saveAll(activeSessions);
        }
    }

    private String generateToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
