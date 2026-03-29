package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.AuthSession;
import com.example.demo.model.User;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {

    Optional<AuthSession> findByTokenHashAndRevokedAtIsNull(String tokenHash);

    List<AuthSession> findByUserAndRevokedAtIsNull(User user);
}
