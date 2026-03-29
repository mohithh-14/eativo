package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Address;
import com.example.demo.model.User;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUser(User user);
}