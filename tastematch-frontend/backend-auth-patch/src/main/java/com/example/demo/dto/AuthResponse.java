package com.example.demo.dto;

import java.time.LocalDateTime;

public record AuthResponse(
        Long id,
        String name,
        String email,
        String token,
        LocalDateTime expiresAt,
        boolean hasTasteProfile) {
}
