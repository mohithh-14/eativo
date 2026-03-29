package com.example.demo.controller;

import java.util.NoSuchElementException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.RequireAuth;
import com.example.demo.dto.TasteProfileRequest;
import com.example.demo.dto.TasteProfileResponse;
import com.example.demo.model.TasteProfile;
import com.example.demo.model.User;
import com.example.demo.repository.TasteProfileRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class TasteProfileController {

    private final TasteProfileRepository tasteProfileRepository;

    public TasteProfileController(TasteProfileRepository tasteProfileRepository) {
        this.tasteProfileRepository = tasteProfileRepository;
    }

    @RequireAuth
    @PostMapping("/me")
    public TasteProfileResponse saveProfile(HttpServletRequest request, @Valid @RequestBody TasteProfileRequest payload) {
        User user = AuthRequestSupport.requireUser(request);
        TasteProfile profile = tasteProfileRepository.findByUser(user);

        if (profile == null) {
            profile = new TasteProfile();
            profile.setUser(user);
        }

        profile.setCuisine(payload.getCuisine().trim());
        profile.setSpiceLevel(String.valueOf(payload.getSpiceLevel()));
        profile.setDietType(payload.getDietType().trim());
        profile.setBudgetRange(payload.getBudgetRange().trim());
        profile.setRatingImportance(payload.getRatingImportance());

        TasteProfile savedProfile = tasteProfileRepository.save(profile);
        return toResponse(savedProfile);
    }

    @RequireAuth
    @GetMapping("/me")
    public TasteProfileResponse getProfile(HttpServletRequest request) {
        User user = AuthRequestSupport.requireUser(request);
        TasteProfile profile = tasteProfileRepository.findByUser(user);
        if (profile == null) {
            throw new NoSuchElementException("Taste profile not found for this user");
        }
        return toResponse(profile);
    }

    private TasteProfileResponse toResponse(TasteProfile profile) {
        return new TasteProfileResponse(
                profile.getUser().getId(),
                profile.getCuisine(),
                profile.getSpiceLevel(),
                profile.getDietType(),
                profile.getBudgetRange(),
                profile.getRatingImportance());
    }
}
