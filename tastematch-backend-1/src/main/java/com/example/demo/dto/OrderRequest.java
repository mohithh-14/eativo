package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class OrderRequest {

    @PositiveOrZero(message = "Total amount cannot be negative")
    private double totalAmount;

    @NotBlank(message = "Delivery address is required")
    @Size(max = 255, message = "Delivery address must be 255 characters or fewer")
    private String address;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "UPI|Card|COD", message = "Payment method must be UPI, Card, or COD")
    private String paymentMethod;

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
