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
