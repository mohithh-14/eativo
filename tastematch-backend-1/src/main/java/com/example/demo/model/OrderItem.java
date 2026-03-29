package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private FoodOrder order;

    @ManyToOne
    private MenuItem menuItem;

    private int quantity;

    public OrderItem() {}

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public FoodOrder getOrder() { return order; }

    public void setOrder(FoodOrder order) { this.order = order; }

    public MenuItem getMenuItem() { return menuItem; }

    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }

    public int getQuantity() { return quantity; }

    public void setQuantity(int quantity) { this.quantity = quantity; }
}