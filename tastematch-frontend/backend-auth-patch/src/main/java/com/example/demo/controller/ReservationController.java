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
