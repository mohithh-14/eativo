package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TasteProfileRequest {

    @NotBlank(message = "Cuisine is required")
    @Size(max = 60, message = "Cuisine must be 60 characters or fewer")
    private String cuisine;

    @NotNull(message = "Spice level is required")
    @Min(value = 0, message = "Spice level must be at least 0")
    @Max(value = 100, message = "Spice level must be at most 100")
    private Integer spiceLevel;

    @NotBlank(message = "Diet type is required")
    @Size(max = 40, message = "Diet type must be 40 characters or fewer")
    private String dietType;

    @NotBlank(message = "Budget range is required")
    @Size(max = 40, message = "Budget range must be 40 characters or fewer")
    private String budgetRange;

    @NotNull(message = "Rating importance is required")
    @Min(value = 1, message = "Rating importance must be at least 1")
    @Max(value = 5, message = "Rating importance must be at most 5")
    private Integer ratingImportance;

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public Integer getSpiceLevel() {
        return spiceLevel;
    }

    public void setSpiceLevel(Integer spiceLevel) {
        this.spiceLevel = spiceLevel;
    }

    public String getDietType() {
        return dietType;
    }

    public void setDietType(String dietType) {
        this.dietType = dietType;
    }

    public String getBudgetRange() {
        return budgetRange;
    }

    public void setBudgetRange(String budgetRange) {
        this.budgetRange = budgetRange;
    }

    public Integer getRatingImportance() {
        return ratingImportance;
    }

    public void setRatingImportance(Integer ratingImportance) {
        this.ratingImportance = ratingImportance;
    }
}
