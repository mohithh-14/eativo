package com.example.demo.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.RequireAuth;
import com.example.demo.model.Rating;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.RatingRepository;
import com.example.demo.repository.RestaurantRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingRepository ratingRepository;
    private final RestaurantRepository restaurantRepository;

    public RatingController(RatingRepository ratingRepository, RestaurantRepository restaurantRepository) {
        this.ratingRepository = ratingRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @RequireAuth
    @PostMapping
    public Rating addRating(
            HttpServletRequest request,
            @RequestParam Long restaurantId,
            @RequestBody Rating rating) {
        User user = AuthRequestSupport.requireUser(request);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Restaurant not found"));
        rating.setUser(user);
        rating.setRestaurant(restaurant);
        return ratingRepository.save(rating);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Rating> getRatingsForRestaurant(@PathVariable Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Restaurant not found"));
        return ratingRepository.findByRestaurant(restaurant);
    }
}
