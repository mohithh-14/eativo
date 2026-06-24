package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.RequireAuth;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.OtpRequest;
import com.example.demo.dto.OtpVerificationRequest;
import com.example.demo.dto.RegisterUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.OtpService;
import com.example.demo.service.SessionAuthService;
import com.example.demo.util.HtmlSanitizer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionAuthService sessionAuthService;
    private final OtpService otpService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SessionAuthService sessionAuthService,
            OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionAuthService = sessionAuthService;
        this.otpService = otpService;
    }

    @PostMapping("/register/request-otp")
    public ResponseEntity<Void> requestOtp(@Valid @RequestBody OtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        String otpCode = otpService.generateAndStoreOtp(request);
        otpService.sendOtpEmail(request.getEmail().trim(), otpCode);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        OtpService.PendingRegistration pending = otpService.getPendingRegistration(normalizedEmail);

        if (pending == null) {
            throw new IllegalArgumentException("No pending registration found or verification session expired. Please request a new code.");
        }

        if (pending.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            otpService.removePendingRegistration(normalizedEmail);
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        if (!pending.getOtpCode().equals(request.getOtpCode().trim())) {
            throw new IllegalArgumentException("Invalid verification code. Please check and try again.");
        }

        OtpRequest details = pending.getOtpRequest();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setName(HtmlSanitizer.sanitize(details.getName()));
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(details.getPassword()));

        User savedUser = userRepository.save(user);
        otpService.removePendingRegistration(normalizedEmail);
        return ResponseEntity.ok(sessionAuthService.createAuthResponse(savedUser));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setName(HtmlSanitizer.sanitize(request.getName()));
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(sessionAuthService.createAuthResponse(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase());
        if (user == null) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        boolean passwordMatches;
        try {
            passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        } catch (IllegalArgumentException exception) {
            passwordMatches = request.getPassword().equals(user.getPassword());
            if (passwordMatches) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return ResponseEntity.ok(sessionAuthService.createAuthResponse(user));
    }

    @RequireAuth
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        sessionAuthService.revokeSession(AuthRequestSupport.requireSession(request));
        return ResponseEntity.noContent().build();
    }

    @RequireAuth
    @GetMapping("/me")
    public UserResponse getCurrentUser(HttpServletRequest request) {
        User user = AuthRequestSupport.requireUser(request);
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
