package com.example.demo.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.dto.OtpRequest;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class OtpService {

    @Value("${app.sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${app.sendgrid.from-email:no-reply@eativo.com}")
    private String fromEmail;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, PendingRegistration> otpCache = new ConcurrentHashMap<>();

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

    @org.springframework.scheduling.annotation.Async
    public void sendOtpEmail(String email, String otpCode) {
        String subject = "Your Eativo Verification Code";
        String text = "Welcome to Eativo!\n\n"
                + "Your 6-digit verification code is: " + otpCode + "\n\n"
                + "This code is valid for 5 minutes. If you did not request this code, please ignore this email.\n\n"
                + "Happy Dining,\n"
                + "The Eativo Team";

        if (sendGridApiKey == null || sendGridApiKey.trim().isEmpty()) {
            System.err.println("WARNING: SENDGRID_API_KEY is not configured. Fallback: Logging OTP to console.");
        } else {
            try {
                Email from = new Email(fromEmail);
                Email to = new Email(email);
                Content content = new Content("text/plain", text);
                Mail mail = new Mail(from, subject, to, content);

                SendGrid sg = new SendGrid(sendGridApiKey);
                Request request = new Request();
                request.setMethod(Method.POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());
                Response response = sg.api(request);
                
                System.out.println("SendGrid Email Status: " + response.getStatusCode());
                if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                    System.out.println("OTP email sent successfully to: " + email);
                } else {
                    System.err.println("WARNING: SendGrid API returned non-success status: " + response.getStatusCode());
                    System.err.println("Response Body: " + response.getBody());
                }
            } catch (Exception e) {
                System.err.println("WARNING: Could not send real email via SendGrid. Fallback: Logging OTP to console.");
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
