package com.example.demo.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.demo.dto.OtpRequest;

@Service
public class OtpService {

    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, PendingRegistration> otpCache = new ConcurrentHashMap<>();

    public OtpService(@org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public static class PendingRegistration {
        private final OtpRequest otpRequest;
        private final String otpCode;
        private final LocalDateTime expiresAt;

        public PendingRegistration(OtpRequest otpRequest, String otpCode, LocalDateTime expiresAt) {
            this.otpRequest = otpRequest;
            this.otpCode = otpCode;
            this.expiresAt = expiresAt;
        }

        public OtpRequest getOtpRequest() {
            return otpRequest;
        }

        public String getOtpCode() {
            return otpCode;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }
    }

    public String generateAndStoreOtp(OtpRequest request) {
        String otpCode = String.format("%06d", secureRandom.nextInt(1000000));
        PendingRegistration pending = new PendingRegistration(
                request,
                otpCode,
                LocalDateTime.now().plusMinutes(5)
        );
        otpCache.put(request.getEmail().toLowerCase().trim(), pending);
        return otpCode;
    }

    public void sendOtpEmail(String email, String otpCode) {
        String subject = "Your Eativo Verification Code";
        String text = "Welcome to Eativo!\n\n"
                + "Your 6-digit verification code is: " + otpCode + "\n\n"
                + "This code is valid for 5 minutes. If you did not request this code, please ignore this email.\n\n"
                + "Happy Dining,\n"
                + "The Eativo Team";

        if (mailSender == null) {
            System.err.println("WARNING: JavaMailSender is not configured. Fallback: Logging OTP to console.");
        } else {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject(subject);
                message.setText(text);
                message.setFrom("no-reply@eativo.com");
                mailSender.send(message);
                System.out.println("OTP email sent successfully to: " + email);
            } catch (Exception e) {
                System.err.println("WARNING: Could not send real email via SMTP. Fallback: Logging OTP to console.");
                System.err.println("Email Error details: " + e.getMessage());
            }
        }

        System.out.println("==================================================");
        System.out.println("   [EATIVO SECURITY LOG] OTP CODE GENERATED");
        System.out.println("   Email: " + email);
        System.out.println("   Code:  " + otpCode);
        System.out.println("==================================================");
    }

    public PendingRegistration getPendingRegistration(String email) {
        if (email == null) {
            return null;
        }
        return otpCache.get(email.toLowerCase().trim());
    }

    public void removePendingRegistration(String email) {
        if (email != null) {
            otpCache.remove(email.toLowerCase().trim());
        }
    }
}
