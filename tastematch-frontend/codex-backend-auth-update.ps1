 = 'C:\Users\Mohith\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\tastematch-backend-1'
 = Join-Path  'src\main\java\com\example\demo\auth'
 = Join-Path  'src\main\java\com\example\demo\config'
 = Join-Path  'src\main\java\com\example\demo\controller'
 = Join-Path  'src\main\java\com\example\demo\dto'
 = Join-Path  'src\main\java\com\example\demo\model'
 = Join-Path  'src\main\java\com\example\demo\repository'
 = Join-Path  'src\main\java\com\example\demo\service'

New-Item -ItemType Directory -Force -Path ,  | Out-Null

@'
package com.example.demo.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAuth {
}
'@ | Set-Content -Path (Join-Path  'RequireAuth.java') -Encoding UTF8

@'
package com.example.demo.auth;

public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
'@ | Set-Content -Path (Join-Path  'UnauthorizedException.java') -Encoding UTF8

@'
package com.example.demo.auth;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
'@ | Set-Content -Path (Join-Path  'ForbiddenException.java') -Encoding UTF8

@'
package com.example.demo.auth;

import com.example.demo.model.AuthSession;
import com.example.demo.model.User;

import jakarta.servlet.http.HttpServletRequest;

public final class AuthRequestSupport {

    private AuthRequestSupport() {
    }

    public static User requireUser(HttpServletRequest request) {
        Object authenticatedUser = request.getAttribute("authenticatedUser");
        if (authenticatedUser instanceof User user) {
            return user;
        }
        throw new UnauthorizedException("Authentication required");
    }

    public static AuthSession requireSession(HttpServletRequest request) {
        Object authSession = request.getAttribute("authSession");
        if (authSession instanceof AuthSession session) {
            return session;
        }
        throw new UnauthorizedException("Authentication required");
    }
}
'@ | Set-Content -Path (Join-Path  'AuthRequestSupport.java') -Encoding UTF8

@'
package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "auth_sessions", indexes = {
        @Index(name = "idx_auth_sessions_token_hash", columnList = "tokenHash", unique = true)
})
public class AuthSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime revokedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}
'@ | Set-Content -Path (Join-Path  'AuthSession.java') -Encoding UTF8

@'
package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.AuthSession;
import com.example.demo.model.User;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {

    Optional<AuthSession> findByTokenHashAndRevokedAtIsNull(String tokenHash);

    List<AuthSession> findByUserAndRevokedAtIsNull(User user);
}
'@ | Set-Content -Path (Join-Path  'AuthSessionRepository.java') -Encoding UTF8

@'
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
'@ | Set-Content -Path (Join-Path  'AuthResponse.java') -Encoding UTF8

@'
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
            @Value("") long sessionDays) {
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
'@ | Set-Content -Path (Join-Path  'SessionAuthService.java') -Encoding UTF8

@'
package com.example.demo.config;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.example.demo.auth.RequireAuth;
import com.example.demo.auth.UnauthorizedException;
import com.example.demo.model.AuthSession;
import com.example.demo.service.SessionAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final SessionAuthService sessionAuthService;

    public AuthInterceptor(SessionAuthService sessionAuthService) {
        this.sessionAuthService = sessionAuthService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod) || !requiresAuth(handlerMethod)) {
            return true;
        }

        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authentication required");
        }

        String token = authorizationHeader.substring(7).trim();
        if (token.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }

        AuthSession authSession = sessionAuthService.authenticate(token);
        request.setAttribute("authenticatedUser", authSession.getUser());
        request.setAttribute("authSession", authSession);
        return true;
    }

    private boolean requiresAuth(HandlerMethod handlerMethod) {
        return handlerMethod.hasMethodAnnotation(RequireAuth.class)
                || handlerMethod.getBeanType().isAnnotationPresent(RequireAuth.class);
    }
}
'@ | Set-Content -Path (Join-Path  'AuthInterceptor.java') -Encoding UTF8

@'
package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebAuthConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public WebAuthConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor);
    }
}
'@ | Set-Content -Path (Join-Path  'WebAuthConfig.java') -Encoding UTF8

@'
package com.example.demo.config;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.demo.auth.ForbiddenException;
import com.example.demo.auth.UnauthorizedException;
import com.example.demo.dto.ApiError;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining("; "));
        return buildError(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException exception,
            HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(
            UnauthorizedException exception,
            HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, exception.getMessage(), request);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbidden(
            ForbiddenException exception,
            HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiError> handleNotFound(
            NoSuchElementException exception,
            HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(
            Exception exception,
            HttpServletRequest request) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", request);
    }

    private ResponseEntity<ApiError> buildError(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ApiError(
                OffsetDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()));
    }

    private String formatFieldError(FieldError fieldError) {
        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
    }
}
'@ | Set-Content -Path (Join-Path  'GlobalExceptionHandler.java') -Encoding UTF8

@'
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
import com.example.demo.dto.RegisterUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.SessionAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionAuthService sessionAuthService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SessionAuthService sessionAuthService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionAuthService = sessionAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
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
'@ | Set-Content -Path (Join-Path  'UserController.java') -Encoding UTF8

@'
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
'@ | Set-Content -Path (Join-Path  'TasteProfileController.java') -Encoding UTF8

@'
package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.ForbiddenException;
import com.example.demo.auth.RequireAuth;
import com.example.demo.dto.OrderRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.model.FoodOrder;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.FoodOrderRepository;
import com.example.demo.repository.RestaurantRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final FoodOrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;

    public OrderController(FoodOrderRepository orderRepository, RestaurantRepository restaurantRepository) {
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @RequireAuth
    @PostMapping
    public OrderResponse placeOrder(
            HttpServletRequest request,
            @RequestParam Long restaurantId,
            @Valid @RequestBody OrderRequest payload) {
        User user = AuthRequestSupport.requireUser(request);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Restaurant not found"));

        FoodOrder order = new FoodOrder();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("Preparing");
        order.setTotalAmount(payload.getTotalAmount());
        order.setPaymentMethod(payload.getPaymentMethod());
        order.setDeliveryAddress(payload.getAddress().trim());

        return toResponse(orderRepository.save(order));
    }

    @RequireAuth
    @GetMapping("/me")
    public List<OrderResponse> getUserOrders(HttpServletRequest request) {
        User user = AuthRequestSupport.requireUser(request);
        return orderRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @RequireAuth
    @PostMapping("/{orderId}/cancel")
    public OrderResponse cancelOrder(HttpServletRequest request, @PathVariable Long orderId) {
        User user = AuthRequestSupport.requireUser(request);
        FoodOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only cancel your own orders");
        }

        order.setStatus("Cancelled");
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(FoodOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getOrderTime(),
                "35 mins",
                order.getPaymentMethod(),
                order.getTotalAmount(),
                order.getRestaurant().getId(),
                order.getRestaurant().getName());
    }
}
'@ | Set-Content -Path (Join-Path  'OrderController.java') -Encoding UTF8

@'
package com.example.demo.controller;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.ForbiddenException;
import com.example.demo.auth.RequireAuth;
import com.example.demo.dto.ReservationRequest;
import com.example.demo.dto.ReservationResponse;
import com.example.demo.model.Reservation;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.ReservationRepository;
import com.example.demo.repository.RestaurantRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;

    public ReservationController(
            ReservationRepository reservationRepository,
            RestaurantRepository restaurantRepository) {
        this.reservationRepository = reservationRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @RequireAuth
    @PostMapping
    public ReservationResponse bookTable(
            HttpServletRequest request,
            @RequestParam Long restaurantId,
            @Valid @RequestBody ReservationRequest payload) {

        User user = AuthRequestSupport.requireUser(request);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Restaurant not found"));

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRestaurant(restaurant);
        reservation.setStatus("BOOKED");
        reservation.setReservationDate(payload.getDate());
        reservation.setReservationTime(payload.getTime());
        reservation.setNumberOfGuests(payload.getGuests());

        return toResponse(reservationRepository.save(reservation));
    }

    @RequireAuth
    @GetMapping("/me")
    public List<ReservationResponse> getUserReservations(HttpServletRequest request) {
        User user = AuthRequestSupport.requireUser(request);

        return reservationRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<ReservationResponse> getRestaurantReservations(@PathVariable Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Restaurant not found"));

        return reservationRepository.findByRestaurant(restaurant).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @RequireAuth
    @DeleteMapping("/{reservationId}")
    public ReservationResponse cancelReservation(HttpServletRequest request, @PathVariable Long reservationId) {
        User user = AuthRequestSupport.requireUser(request);
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("Reservation not found"));

        if (reservation.getUser() == null || !reservation.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only cancel your own reservations");
        }

        reservation.setStatus("CANCELLED");
        return toResponse(reservationRepository.save(reservation));
    }

    private ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getRestaurant().getId(),
                reservation.getRestaurant().getName(),
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getNumberOfGuests(),
                reservation.getStatus());
    }
}
'@ | Set-Content -Path (Join-Path  'ReservationController.java') -Encoding UTF8

@'
package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.RequireAuth;
import com.example.demo.model.Address;
import com.example.demo.model.User;
import com.example.demo.repository.AddressRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    private final AddressRepository addressRepository;

    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @RequireAuth
    @PostMapping("/me")
    public Address addAddress(HttpServletRequest request, @RequestBody Address address) {
        User user = AuthRequestSupport.requireUser(request);
        address.setUser(user);
        return addressRepository.save(address);
    }

    @RequireAuth
    @GetMapping("/me")
    public List<Address> getAddresses(HttpServletRequest request) {
        User user = AuthRequestSupport.requireUser(request);
        return addressRepository.findByUser(user);
    }
}
'@ | Set-Content -Path (Join-Path  'AddressController.java') -Encoding UTF8

@'
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
'@ | Set-Content -Path (Join-Path  'RatingController.java') -Encoding UTF8
