package com.example.demo.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("(\\d+)");

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
        String cuisineFilter = normalizeText(cuisine);
        String locationFilter = normalizeText(location);

        List<RecommendationDTO> result = new ArrayList<>();

        for (Restaurant restaurant : restaurantRepository.findAll()) {
            String restaurantLocation = normalizeText(restaurant.getLocation());
            String restaurantCuisine = normalizeText(restaurant.getCuisine());
            boolean matchesLocation = locationFilter.isBlank() || restaurantLocation.contains(locationFilter);
            boolean matchesCuisine = cuisineFilter.isBlank() || restaurantCuisine.contains(cuisineFilter);

            if (!matchesLocation || !matchesCuisine) {
                continue;
            }

            List<Rating> ratings = ratingRepository.findByRestaurant(restaurant);
            double avgRating = getAverageRating(ratings);
            double score = avgRating * 9;

            if (profile != null) {
                int ratingImportance = Math.max(1, Math.min(profile.getRatingImportance(), 5));
                score += avgRating * ratingImportance * 1.4;
                score += getCuisineAffinity(profile.getCuisine(), restaurant.getCuisine());
                score += getBudgetAffinity(profile.getBudgetRange(), restaurant.getPriceRange());
                score += getSpiceAffinity(parseSpiceLevel(profile.getSpiceLevel()), restaurant.getCuisine());
                score += getDietAffinity(profile.getDietType(), restaurant.getCuisine());
            } else {
                score += 18;
            }

            RecommendationDTO dto = new RecommendationDTO(
                    restaurant.getId(),
                    restaurant.getName(),
                    restaurant.getCuisine(),
                    restaurant.getPriceRange(),
                    avgRating,
                    Math.min(score, 99));
            dto.setTopRated(avgRating >= 4.5);
            dto.setTrending(ratings.size() >= 2);
            result.add(dto);
        }

        result.sort((left, right) -> Double.compare(right.getMatchScore(), left.getMatchScore()));
        return result;
    }

    private double getCuisineAffinity(String preferredCuisine, String restaurantCuisine) {
        String normalizedPreferredCuisine = normalizeText(preferredCuisine);
        String normalizedRestaurantCuisine = normalizeText(restaurantCuisine);

        if (normalizedPreferredCuisine.isBlank() || normalizedRestaurantCuisine.isBlank()) {
            return 0;
        }

        if (normalizedRestaurantCuisine.equals(normalizedPreferredCuisine)) {
            return 30;
        }

        if (normalizedRestaurantCuisine.contains(normalizedPreferredCuisine)
                || normalizedPreferredCuisine.contains(normalizedRestaurantCuisine)) {
            return 16;
        }

        if (normalizedRestaurantCuisine.contains("multi-cuisine")) {
            return 10;
        }

        return 0;
    }

    private double getBudgetAffinity(String preferredBudget, String restaurantBudget) {
        int preferredValue = parseBudgetValue(preferredBudget);
        int restaurantValue = parseBudgetValue(restaurantBudget);

        if (preferredValue == 0 || restaurantValue == 0) {
            return 0;
        }

        int difference = Math.abs(preferredValue - restaurantValue);
        if (difference <= 100) {
            return 14;
        }
        if (difference <= 200) {
            return 10;
        }
        if (difference <= 350) {
            return 6;
        }
        return 0;
    }

    private double getSpiceAffinity(int spiceLevel, String restaurantCuisine) {
        String normalizedRestaurantCuisine = normalizeText(restaurantCuisine);
        if (normalizedRestaurantCuisine.isBlank()) {
            return 0;
        }

        boolean spicyCuisine = normalizedRestaurantCuisine.equals("hyderabadi")
                || normalizedRestaurantCuisine.equals("mughlai")
                || normalizedRestaurantCuisine.equals("indian");

        if (spiceLevel >= 80) {
            return spicyCuisine ? 8 : 3;
        }
        if (spiceLevel >= 60) {
            return spicyCuisine ? 5 : 2;
        }
        if (spiceLevel <= 30) {
            return spicyCuisine ? -2 : 5;
        }
        if (spiceLevel <= 50) {
            return spicyCuisine ? 1 : 3;
        }
        return 0;
    }

    private double getDietAffinity(String dietType, String restaurantCuisine) {
        String normalizedDietType = normalizeText(dietType);
        String normalizedRestaurantCuisine = normalizeText(restaurantCuisine);

        if (normalizedDietType.isBlank() || normalizedRestaurantCuisine.isBlank()) {
            return 0;
        }

        if (normalizedDietType.equals("veg")) {
            if (normalizedRestaurantCuisine.equals("south indian")) {
                return 12;
            }
            if (normalizedRestaurantCuisine.equals("multi-cuisine")) {
                return 8;
            }
            if (normalizedRestaurantCuisine.equals("indian")) {
                return 6;
            }
            if (normalizedRestaurantCuisine.equals("hyderabadi")) {
                return 2;
            }
            return normalizedRestaurantCuisine.equals("mughlai") ? -3 : 0;
        }

        if (normalizedDietType.equals("vegan")) {
            if (normalizedRestaurantCuisine.equals("south indian")) {
                return 12;
            }
            if (normalizedRestaurantCuisine.equals("multi-cuisine")) {
                return 8;
            }
            if (normalizedRestaurantCuisine.equals("indian")) {
                return 4;
            }
            if (normalizedRestaurantCuisine.equals("hyderabadi")) {
                return -4;
            }
            return normalizedRestaurantCuisine.equals("mughlai") ? -5 : 0;
        }

        if (normalizedDietType.equals("eggetarian")) {
            if (normalizedRestaurantCuisine.equals("south indian")) {
                return 10;
            }
            if (normalizedRestaurantCuisine.equals("multi-cuisine")) {
                return 8;
            }
            if (normalizedRestaurantCuisine.equals("indian")) {
                return 6;
            }
            if (normalizedRestaurantCuisine.equals("hyderabadi")) {
                return 4;
            }
            return normalizedRestaurantCuisine.equals("mughlai") ? 3 : 0;
        }

        if (normalizedDietType.equals("non-veg")) {
            if (normalizedRestaurantCuisine.equals("hyderabadi")) {
                return 12;
            }
            if (normalizedRestaurantCuisine.equals("mughlai")) {
                return 11;
            }
            if (normalizedRestaurantCuisine.equals("indian")) {
                return 8;
            }
            if (normalizedRestaurantCuisine.equals("multi-cuisine")) {
                return 6;
            }
            return normalizedRestaurantCuisine.equals("south indian") ? 3 : 0;
        }

        return 0;
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

    private int parseBudgetValue(String priceRange) {
        if (priceRange == null || priceRange.isBlank()) {
            return 0;
        }

        Matcher matcher = AMOUNT_PATTERN.matcher(priceRange.replace(",", ""));
        int amount = 0;
        while (matcher.find()) {
            amount = Integer.parseInt(matcher.group(1));
        }
        return amount;
    }

    private double getAverageRating(List<Rating> ratings) {
        if (ratings.isEmpty()) {
            return 4.2;
        }
        double sum = 0;
        for (Rating rating : ratings) {
            sum += rating.getStars();
        }
        return sum / ratings.size();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}