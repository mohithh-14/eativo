package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private FoodOrder order;

    private double amount;

    private String status; // PENDING, SUCCESS, FAILED

    private String upiId;

    private LocalDateTime createdAt;

    public Payment() {}

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public FoodOrder getOrder() { return order; }

    public void setOrder(FoodOrder order) { this.order = order; }

    public double getAmount() { return amount; }

    public void setAmount(double amount) { this.amount = amount; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public String getUpiId() { return upiId; }

    public void setUpiId(String upiId) { this.upiId = upiId; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}