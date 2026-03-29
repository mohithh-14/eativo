package com.example.demo.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.*;
import com.example.demo.repository.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FoodOrderRepository orderRepository;

    // Create payment (before redirect)
    @PostMapping("/create")
    public Payment createPayment(@RequestParam Long orderId) {

        FoodOrder order = orderRepository.findById(orderId).orElseThrow();

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus("PENDING");
        payment.setUpiId("9381177400-2@axl");
        payment.setCreatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    // Mark payment success (after UPI)
    @PostMapping("/success")
    public Payment markSuccess(@RequestParam Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId).orElseThrow();

        payment.setStatus("SUCCESS");

        return paymentRepository.save(payment);
    }

    // Mark failed
    @PostMapping("/failed")
    public Payment markFailed(@RequestParam Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId).orElseThrow();

        payment.setStatus("FAILED");

        return paymentRepository.save(payment);
    }
}
