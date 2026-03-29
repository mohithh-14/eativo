package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReservationRequest {

    @NotNull(message = "Reservation date is required")
    private LocalDate date;

    @NotNull(message = "Reservation time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least one guest is required")
    @Max(value = 20, message = "Guest count cannot exceed 20")
    private Integer guests;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }
}
