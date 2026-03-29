package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.TasteProfile;
import com.example.demo.model.User;

public interface TasteProfileRepository extends JpaRepository<TasteProfile, Long> {
    TasteProfile findByUser(User user);
}