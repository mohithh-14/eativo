package com.example.demo.config;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.example.demo.auth.RequireAuth;
import com.example.demo.auth.UnauthorizedException;
import com.example.demo.model.AuthSession;
import com.example.demo.service.SessionAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final SessionAuthService sessionAuthService;

    public AuthInterceptor(SessionAuthService sessionAuthService) {
        this.sessionAuthService = sessionAuthService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod) || !requiresAuth(handlerMethod)) {
            return true;
        }

        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authentication required");
        }

        String token = authorizationHeader.substring(7).trim();
        if (token.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }

        AuthSession authSession = sessionAuthService.authenticate(token);
        request.setAttribute("authenticatedUser", authSession.getUser());
        request.setAttribute("authSession", authSession);
        return true;
    }

    private boolean requiresAuth(HandlerMethod handlerMethod) {
        return handlerMethod.hasMethodAnnotation(RequireAuth.class)
                || handlerMethod.getBeanType().isAnnotationPresent(RequireAuth.class);
    }
}
