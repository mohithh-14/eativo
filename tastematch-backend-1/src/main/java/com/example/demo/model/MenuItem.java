package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Restaurant restaurant;

    private String name;
    private String description;
    private double price;
    private String category;

    public MenuItem() {}

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Restaurant getRestaurant() { return restaurant; }

    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }

    public void setPrice(double price) { this.price = price; }

    public String getCategory() { return category; }

    public void setCategory(String category) { this.category = category; }
}