package com.example.demo.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class RateLimiterService {

    private final Map<String, RequestTracker> trackers = new ConcurrentHashMap<>();

    private static class RequestTracker {
        private final long[] requestTimestamps;
        private int pointer = 0;
        private final int limit;
        private final long windowMs;

        public RequestTracker(int limit, long windowMs) {
            this.limit = limit;
            this.windowMs = windowMs;
            this.requestTimestamps = new long[limit];
        }

        public synchronized boolean isAllowed() {
            long now = System.currentTimeMillis();
            long threshold = now - windowMs;
            long oldestTimestamp = requestTimestamps[pointer];

            if (oldestTimestamp > threshold) {
                return false;
            }

            requestTimestamps[pointer] = now;
            pointer = (pointer + 1) % limit;
            return true;
        }
    }

    public boolean isAllowed(String ip, String type) {
        String key = ip + ":" + type;
        int limit = "auth".equals(type) ? 5 : 60;
        long windowMs = 60000;

        RequestTracker tracker = trackers.computeIfAbsent(key, k -> new RequestTracker(limit, windowMs));
        return tracker.isAllowed();
    }
}
