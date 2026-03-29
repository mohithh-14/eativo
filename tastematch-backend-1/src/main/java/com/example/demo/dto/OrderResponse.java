package com.example.demo.dto;

import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String status,
        LocalDateTime orderTime,
        String estimatedDelivery,
        String paymentMethod,
        double totalAmount,
        Long restaurantId,
        String restaurantName) {
}
