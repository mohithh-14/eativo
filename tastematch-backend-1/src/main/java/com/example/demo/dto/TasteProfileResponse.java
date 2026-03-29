package com.example.demo.dto;

public record TasteProfileResponse(
        Long userId,
        String cuisine,
        String spiceLevel,
        String dietType,
        String budgetRange,
        int ratingImportance) {
}
