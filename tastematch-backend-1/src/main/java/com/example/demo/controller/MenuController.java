package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.*;
import com.example.demo.repository.*;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @PostMapping
    public MenuItem addMenuItem(@RequestParam Long restaurantId, @RequestBody MenuItem item) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();

        item.setRestaurant(restaurant);

        return menuItemRepository.save(item);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuItem> getMenu(@PathVariable Long restaurantId) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();

        return menuItemRepository.findByRestaurant(restaurant);
    }
}
