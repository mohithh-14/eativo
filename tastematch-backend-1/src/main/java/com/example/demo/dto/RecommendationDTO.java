package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RecommendationDTO {

    @JsonProperty("id")
    private Long restaurantId;
    private String name;
    private String cuisine;
    private String priceRange;
    private double avgRating;
    private double matchScore;
    private boolean topRated;
    private boolean trending;

    public RecommendationDTO() {
    }

    public RecommendationDTO(Long restaurantId, String name, String cuisine, String priceRange, double avgRating, double matchScore) {
        this.restaurantId = restaurantId;
        this.name = name;
        this.cuisine = cuisine;
        this.priceRange = priceRange;
        this.avgRating = avgRating;
        this.matchScore = matchScore;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public Long getId() {
        return restaurantId;
    }

    public void setId(Long id) {
        this.restaurantId = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public String getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }

    public double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(double avgRating) {
        this.avgRating = avgRating;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(double matchScore) {
        this.matchScore = matchScore;
    }

    public boolean isTopRated() {
        return topRated;
    }

    public void setTopRated(boolean topRated) {
        this.topRated = topRated;
    }

    public boolean isTrending() {
        return trending;
    }

    public void setTrending(boolean trending) {
        this.trending = trending;
    }
}
