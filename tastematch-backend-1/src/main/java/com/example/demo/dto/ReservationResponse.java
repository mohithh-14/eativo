package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long restaurantId,
        String restaurantName,
        LocalDate date,
        LocalTime time,
        int guests,
        String status) {
}
