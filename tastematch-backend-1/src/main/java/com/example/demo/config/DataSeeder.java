package com.example.demo.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.model.MenuItem;
import com.example.demo.model.Rating;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.RatingRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.UserRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository,
            UserRepository userRepository, RatingRepository ratingRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (restaurantRepository.count() > 0) {
                return;
            }

            Restaurant paradise = createRestaurant("Paradise Biryani", "Hyderabadi", "Secunderabad", "Rs 900");
            Restaurant shahGhouse = createRestaurant("Shah Ghouse Cafe", "Mughlai", "Tolichowki", "Rs 850");
            Restaurant chutneys = createRestaurant("Chutneys", "South Indian", "Banjara Hills", "Rs 700");
            Restaurant bawarchi = createRestaurant("Bawarchi", "Hyderabadi", "RTC Cross Roads", "Rs 800");
            Restaurant pistaHouse = createRestaurant("Pista House", "Hyderabadi", "Charminar", "Rs 950");
            Restaurant meridian = createRestaurant("Meridian", "Multi-Cuisine", "Panjagutta", "Rs 1000");
            Restaurant cafeBahar = createRestaurant("Cafe Bahar", "Hyderabadi", "Basheerbagh", "Rs 780");
            Restaurant mehfil = createRestaurant("Mehfil", "Indian", "Narayanguda", "Rs 720");

            List<Restaurant> restaurants = restaurantRepository.saveAll(List.of(
                    paradise, shahGhouse, chutneys, bawarchi, pistaHouse, meridian, cafeBahar, mehfil));

            seedMenu(menuItemRepository, restaurants.get(0), List.of(
                    menu("Chicken Dum Biryani", "Long-grain rice layered with masala chicken and slow-finished on dum.", 349, "Biryani"),
                    menu("Mutton Biryani", "Tender mutton, saffron rice, and the signature Paradise spice blend.", 429, "Biryani"),
                    menu("Apollo Fish", "Crisp fish bites tossed in a spicy yogurt-chili coating.", 339, "Starters"),
                    menu("Mirchi Ka Salan", "Tangy peanut and chili curry that pairs perfectly with biryani.", 129, "Sides"),
                    menu("Qubani Ka Meetha", "Apricot dessert finished with cream and toasted nuts.", 149, "Desserts")));
            seedMenu(menuItemRepository, restaurants.get(1), List.of(
                    menu("Special Mutton Biryani", "A richer version of the house biryani with extra masala and juicy mutton.", 459, "Biryani"),
                    menu("Ramzan Haleem", "Slow-cooked wheat, lentils, and meat finished with ghee and fried onions.", 269, "Signature"),
                    menu("Chicken 65", "Bold, crispy, and fiery chicken bites with curry leaf tempering.", 289, "Starters"),
                    menu("Rumali Roti", "Thin, soft flatbread for pairing with gravies.", 39, "Breads"),
                    menu("Kaddu Ki Kheer", "A subtle Hyderabad-style dessert with pumpkin, milk, and cardamom.", 129, "Desserts")));
            seedMenu(menuItemRepository, restaurants.get(2), List.of(
                    menu("Mysore Masala Dosa", "Crisp dosa with spicy chutney spread and potato masala.", 199, "Breakfast"),
                    menu("Ghee Podi Idli", "Soft idlis tossed in podi, ghee, and curry leaf.", 149, "Breakfast"),
                    menu("Ragi Sankati Meal", "Millet ball served with pappu, pachadi, and ghee.", 239, "Meals"),
                    menu("Mini Tiffin", "A sampler plate with dosa, idli, upma, and pongal.", 219, "Combos"),
                    menu("Filter Coffee", "Strong South Indian coffee with a creamy top layer.", 69, "Beverages")));
            seedMenu(menuItemRepository, restaurants.get(3), List.of(
                    menu("Chicken Biryani", "The restaurant favorite with aromatic rice and deep masala notes.", 329, "Biryani"),
                    menu("Keema Samosa", "Crisp pastry pockets with minced meat and warming spices.", 139, "Starters"),
                    menu("Mutton Keema Curry", "Slow-cooked keema in a silky onion-tomato gravy.", 319, "Curries"),
                    menu("Butter Naan", "Soft naan with a buttery finish for scooping curry.", 49, "Breads"),
                    menu("Khubani with Ice Cream", "Apricot compote served chilled with vanilla ice cream.", 159, "Desserts")));
            seedMenu(menuItemRepository, restaurants.get(4), List.of(
                    menu("Zafrani Haleem", "Silky haleem with saffron, fried onions, and a slow-cooked finish.", 299, "Signature"),
                    menu("Family Pack Mutton Biryani", "A festive biryani pack sized for group dinners.", 799, "Biryani"),
                    menu("Chicken Shawarma Plate", "Soft wraps, garlic sauce, and fries on the side.", 249, "Combos"),
                    menu("Baklava Box", "Buttery layered pastry stuffed with nuts and syrup.", 189, "Desserts"),
                    menu("Badam Milk", "Chilled almond milk drink with saffron.", 99, "Beverages")));
            seedMenu(menuItemRepository, restaurants.get(5), List.of(
                    menu("Chicken Mandi", "Arabian-style rice platter with roast chicken and sauces.", 439, "Signature"),
                    menu("Paneer Tikka", "Smoky paneer cubes with peppers and mint chutney.", 279, "Starters"),
                    menu("Chicken Hakka Noodles", "Wok-tossed noodles with vegetables and chili-garlic heat.", 249, "Noodles"),
                    menu("Tandoori Roti", "Whole wheat flatbread baked in a clay oven.", 29, "Breads"),
                    menu("Fresh Lime Soda", "Sweet-salty soda to cool down the spice.", 79, "Beverages")));
            seedMenu(menuItemRepository, restaurants.get(6), List.of(
                    menu("Chicken Biryani", "Fragrant rice, juicy chicken, and a balanced spice profile.", 319, "Biryani"),
                    menu("Talawa Gosht", "Pan-fried mutton with black pepper and green chili.", 339, "Starters"),
                    menu("Egg Biryani", "A lighter biryani option with masala eggs and fried onions.", 249, "Biryani"),
                    menu("Khatti Dal", "Tangy lentils with Hyderabad-style tempering.", 119, "Sides"),
                    menu("Irani Chai", "Slow-brewed tea with milk and a caramelized note.", 45, "Beverages")));
            seedMenu(menuItemRepository, restaurants.get(7), List.of(
                    menu("Special Chicken Biryani", "A hearty biryani portion with masala-coated chicken pieces.", 299, "Biryani"),
                    menu("Chicken 555", "Crispy-fried chicken tossed with peppers and house spices.", 279, "Starters"),
                    menu("Butter Chicken", "Creamy tomato gravy with grilled chicken pieces.", 289, "Curries"),
                    menu("Veg Fried Rice", "Wok-fried rice with vegetables and soy-garlic seasoning.", 199, "Rice"),
                    menu("Falooda", "Rose milk dessert drink with vermicelli and ice cream.", 139, "Desserts")));

            User foodieOne = createUser("Aarav", "aarav@tastematch.local", passwordEncoder);
            User foodieTwo = createUser("Sana", "sana@tastematch.local", passwordEncoder);
            User foodieThree = createUser("Riya", "riya@tastematch.local", passwordEncoder);
            List<User> users = userRepository.saveAll(List.of(foodieOne, foodieTwo, foodieThree));

            seedRating(ratingRepository, users.get(0), restaurants.get(0), 5, "Still my favorite biryani in the city");
            seedRating(ratingRepository, users.get(1), restaurants.get(0), 5, "Excellent dum and salan");
            seedRating(ratingRepository, users.get(2), restaurants.get(1), 5, "Rich haleem and great late-night food");
            seedRating(ratingRepository, users.get(0), restaurants.get(2), 4, "Perfect breakfast option");
            seedRating(ratingRepository, users.get(1), restaurants.get(4), 5, "Best haleem box for family dinners");
            seedRating(ratingRepository, users.get(2), restaurants.get(6), 4, "Reliable biryani and chai combo");
        };
    }

    private Restaurant createRestaurant(String name, String cuisine, String location, String priceRange) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(name);
        restaurant.setCuisine(cuisine);
        restaurant.setLocation(location);
        restaurant.setPriceRange(priceRange);
        return restaurant;
    }

    private MenuItem menu(String name, String description, double price, String category) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        return item;
    }

    private void seedMenu(MenuItemRepository menuItemRepository, Restaurant restaurant, List<MenuItem> items) {
        for (MenuItem item : items) {
            item.setRestaurant(restaurant);
        }
        menuItemRepository.saveAll(items);
    }

    private User createUser(String name, String email, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("demo12345"));
        return user;
    }

    private void seedRating(RatingRepository ratingRepository, User user, Restaurant restaurant, int stars, String comment) {
        Rating rating = new Rating();
        rating.setUser(user);
        rating.setRestaurant(restaurant);
        rating.setStars(stars);
        rating.setComment(comment);
        ratingRepository.save(rating);
    }
}
