package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebAuthConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final RateLimitingInterceptor rateLimitingInterceptor;

    public WebAuthConfig(AuthInterceptor authInterceptor, RateLimitingInterceptor rateLimitingInterceptor) {
        this.authInterceptor = authInterceptor;
        this.rateLimitingInterceptor = rateLimitingInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitingInterceptor);
        registry.addInterceptor(authInterceptor);
    }
}
