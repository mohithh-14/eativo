package com.example.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.RequireAuth;
import com.example.demo.dto.RecommendationDTO;
import com.example.demo.model.Rating;
import com.example.demo.model.Restaurant;
import com.example.demo.model.TasteProfile;
import com.example.demo.model.User;
import com.example.demo.repository.RatingRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.TasteProfileRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final TasteProfileRepository tasteProfileRepository;
    private final RestaurantRepository restaurantRepository;
    private final RatingRepository ratingRepository;

    public RecommendationController(
            TasteProfileRepository tasteProfileRepository,
            RestaurantRepository restaurantRepository,
            RatingRepository ratingRepository) {
        this.tasteProfileRepository = tasteProfileRepository;
        this.restaurantRepository = restaurantRepository;
        this.ratingRepository = ratingRepository;
    }

    @GetMapping("/guest")
    public List<RecommendationDTO> getGuestRecommendations(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String cuisine) {
        return buildRecommendations(null, location, cuisine);
    }

    @RequireAuth
    @GetMapping("/me")
    public List<RecommendationDTO> getAuthenticatedRecommendations(
            HttpServletRequest request,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String cuisine) {
        User user = AuthRequestSupport.requireUser(request);
        TasteProfile profile = tasteProfileRepository.findByUser(user);
        return buildRecommendations(profile, location, cuisine);
    }

    private List<RecommendationDTO> buildRecommendations(TasteProfile profile, String location, String cuisine) {
        String cuisineFilter = cuisine != null ? cuisine.trim().toLowerCase() : "";
        String locationFilter = location != null ? location.trim().toLowerCase() : "";

        List<RecommendationDTO> result = new ArrayList<>();

        for (Restaurant restaurant : restaurantRepository.findAll()) {
            boolean matchesLocation = locationFilter.isBlank()
                    || (restaurant.getLocation() != null && restaurant.getLocation().toLowerCase().contains(locationFilter));
            boolean matchesCuisine = cuisineFilter.isBlank()
                    || (restaurant.getCuisine() != null && restaurant.getCuisine().toLowerCase().contains(cuisineFilter));

            if (!matchesLocation || !matchesCuisine) {
                continue;
            }

            double avgRating = getAverageRating(restaurant);
            double score = avgRating * 12;

            if (profile != null) {
                if (restaurant.getCuisine() != null && profile.getCuisine() != null
                        && restaurant.getCuisine().equalsIgnoreCase(profile.getCuisine())) {
                    score += 45;
                }
                if (restaurant.getPriceRange() != null && profile.getBudgetRange() != null
                        && restaurant.getPriceRange().equalsIgnoreCase(profile.getBudgetRange())) {
                    score += 18;
                }
                if (parseSpiceLevel(profile.getSpiceLevel()) >= 70
                        && ("Hyderabadi".equalsIgnoreCase(restaurant.getCuisine())
                                || "Mughlai".equalsIgnoreCase(restaurant.getCuisine())
                                || "Indian".equalsIgnoreCase(restaurant.getCuisine()))) {
                    score += 8;
                }
            } else {
                score += 20;
            }

            List<Rating> ratings = ratingRepository.findByRestaurant(restaurant);
            RecommendationDTO dto = new RecommendationDTO(
                    restaurant.getId(),
                    restaurant.getName(),
                    restaurant.getCuisine(),
                    restaurant.getPriceRange(),
                    avgRating,
                    score);
            dto.setTopRated(avgRating >= 4.5);
            dto.setTrending(ratings.size() >= 2);
            result.add(dto);
        }

        result.sort((left, right) -> Double.compare(right.getMatchScore(), left.getMatchScore()));
        return result;
    }

    private int parseSpiceLevel(String spiceLevel) {
        if (spiceLevel == null || spiceLevel.isBlank()) {
            return 0;
        }
        try {
            return Integer.parseInt(spiceLevel);
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private double getAverageRating(Restaurant restaurant) {
        List<Rating> ratings = ratingRepository.findByRestaurant(restaurant);
        if (ratings.isEmpty()) {
            return 4.2;
        }
        double sum = 0;
        for (Rating rating : ratings) {
            sum += rating.getStars();
        }
        return sum / ratings.size();
    }
}
