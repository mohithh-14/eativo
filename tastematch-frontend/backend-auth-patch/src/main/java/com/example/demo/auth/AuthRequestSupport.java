package com.example.demo.auth;

import com.example.demo.model.AuthSession;
import com.example.demo.model.User;

import jakarta.servlet.http.HttpServletRequest;

public final class AuthRequestSupport {

    private AuthRequestSupport() {
    }

    public static User requireUser(HttpServletRequest request) {
        Object authenticatedUser = request.getAttribute("authenticatedUser");
        if (authenticatedUser instanceof User user) {
            return user;
        }
        throw new UnauthorizedException("Authentication required");
    }

    public static AuthSession requireSession(HttpServletRequest request) {
        Object authSession = request.getAttribute("authSession");
        if (authSession instanceof AuthSession session) {
            return session;
        }
        throw new UnauthorizedException("Authentication required");
    }
}
