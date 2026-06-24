package com.example.demo.util;

import org.springframework.web.util.HtmlUtils;

public final class HtmlSanitizer {

    private HtmlSanitizer() {
        // Prevent instantiation
    }

    public static String sanitize(String input) {
        if (input == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(input.trim());
    }
}
