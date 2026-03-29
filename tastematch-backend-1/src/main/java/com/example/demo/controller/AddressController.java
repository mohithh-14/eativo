package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.auth.AuthRequestSupport;
import com.example.demo.auth.RequireAuth;
import com.example.demo.model.Address;
import com.example.demo.model.User;
import com.example.demo.repository.AddressRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    private final AddressRepository addressRepository;

    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @RequireAuth
    @PostMapping("/me")
    public Address addAddress(HttpServletRequest request, @RequestBody Address address) {
        User user = AuthRequestSupport.requireUser(request);
        address.setUser(user);
        return addressRepository.save(address);
    }

    @RequireAuth
    @GetMapping("/me")
    public List<Address> getAddresses(HttpServletRequest request) {
        User user = AuthRequestSupport.requireUser(request);
        return addressRepository.findByUser(user);
    }
}
