package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Reservation;
import com.example.demo.model.User;
import com.example.demo.model.Restaurant;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);

    List<Reservation> findByRestaurant(Restaurant restaurant);
}