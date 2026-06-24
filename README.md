# 🍽️ Eativo — AI-Powered Personalized Dining, Ordering & Reservations

Eativo is a next-generation, full-stack dining platform that combines restaurant discovery, personalized taste-profile recommendations, table reservations, and digital food ordering into a unified experience. 

At the heart of Eativo is an **interactive 3D holographic AI Dining Assistant** that lives right in the browser, helping users search menus, receive tailored culinary recommendations, place orders, and track deliveries using simple, natural conversational prompts.

---

## 🌟 Key Features

### 🔍 1. Interactive Restaurant Discovery & Explorer
- **Local Spotlights:** Discover popular dining spots (pre-seeded with iconic locations like Paradise Biryani, Shah Ghouse Cafe, Chutneys, and more).
- **Smart Filtering:** Browse and filter by cuisine type (Hyderabadi, Mughlai, South Indian, Multi-Cuisine), location, price range, and user ratings.
- **Detailed Menus:** View digitized menus categorized by course (Breakfast, Starters, Main Course, Signatures, Desserts, Beverages).

### 🧠 2. Deep Taste Profiling & Recommendations
- **Dynamic Taste Quiz:** A user preference profiling system capturing dietary restrictions (Vegan, Vegetarian, Gluten-Free), spice tolerance (Mild, Medium, Fiery), favorite flavor families, and average budget.
- **Tailored Suggestion Engine:** The Spring Boot backend processes user profiles to recommend specific restaurants and menu items that perfectly align with individual flavor profiles.

### 📅 3. Frictionless Table Reservations
- **Instant Booking:** Select a restaurant, specify date & time, set guest count, and note special requests (e.g., "anniversary seating" or "wheelchair accessible").
- **Reservation Tracking:** Live dashboard showing active and upcoming reservations.

### 🛒 4. Basket Management & Direct Food Ordering
- **Single-Restaurant Basket Validation:** Automatically ensures users build baskets from one kitchen at a time, calculating subtotals, tax, and delivery fees.
- **Convenient Checkout:** Support for multiple simulated payment methods (UPI, Cards, NetBanking) with real-time address validation.

### 🤖 5. Futuristic Holographic AI Assistant (`/assistant`)
- **3D Interactive Avatar:** A fluid, HTML5-canvas-rendered holographic particle sphere that dynamically responds to user interaction (hover/mouse movement) and AI states (`idle`, `listening`, `thinking`, `speaking`).
- **Conversational Actions:**
  - *"Show me spicy chicken options under Rs 500"*
  - *"Recommend some vegan desserts"*
  - *"Add Butter Chicken and Garlic Naan to my basket"*
  - *"Place my order to 123 Gourmet Boulevard"*
  - *"Cancel my pending order #7001"*
- **Adaptive Fallbacks:** Includes a fully functional offline client-side simulation when running without a connected backend, allowing immediate evaluation of features.

### 🔒 6. Enterprise-Grade Security & Operations
- **Session-Based Authentication:** Clean, custom session token interceptor (`AuthInterceptor`) avoiding heavy state-based session bloat.
- **XSS & Injection Protection:** Content sanitization via a custom `HtmlSanitizer` utility and rigid CORS configurations (`WebCorsConfig`).
- **Rate Limiting:** IP-based requests are tracked and rate-limited via a custom `RateLimitingInterceptor` to prevent API abuse.
- **Notification Services:** Integrated SendGrid email module for sending automated receipts, registration verifications, and reservation confirmations.

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Core Library:** React 19 & React DOM 19
- **Routing:** React Router Dom v7 (client-side routing, protected routes)
- **Styling:** TailwindCSS v3 (responsive utility-first layouts) & Custom Vanilla CSS
- **Animations:** Framer Motion (page transitions, micro-interactions, modal popups)
- **Notifications:** React Hot Toast (highly customizable, dynamic toast updates)
- **Icons:** React Icons / FontAwesome v5
- **Interactive Hologram:** Raw HTML5 Canvas rendering particle-physics equations, 3D coordinate rotation matrices, and depth-sorting.

### Backend Architecture
- **Framework:** Spring Boot 3.x (Java 17)
- **Persistence:** Spring Data JPA with Hibernate
- **Database:** H2 Relational Database (configured for file-based persistence at `./data/tastematchdb` with runtime H2-Console exposure)
- **Security:** Spring Security Crypto (BCrypt password hashing), custom CORS filters, and security headers (CSP, HSTS, X-ContentType-Options).
- **Email Delivery:** SendGrid Java SDK Integration
- **Build Tool:** Apache Maven 3.x
- **Development Tooling:** Project Lombok

---

## 📂 Repository Structure

```text
Eativo/
├── tastematch-frontend/             # React Client Application
│   ├── public/                      # Static assets and index.html
│   ├── src/
│   │   ├── components/              # Shared UI (Navbar, Footer, RestaurantCard, FloatingAiWidget)
│   │   ├── config/                  # API clients, auth stores, and environment resolution
│   │   ├── data/                    # Fallback static data & mocks
│   │   ├── pages/                   # Main views (Home, Register, TasteProfile, Discover, Menu, etc.)
│   │   ├── App.jsx                  # Route definitions & theme providers
│   │   └── index.jsx                # React mount point
│   ├── package.json                 # Frontend dependencies and scripts
│   └── tailwind.config.js           # Tailwind utility definitions
│
├── tastematch-backend-1/            # Spring Boot REST API
│   ├── src/
│   │   ├── main/java/com/example/demo/
│   │   │   ├── auth/                # Exceptions and authentication helpers
│   │   │   ├── config/              # CORS, Security, Interceptors, and DataSeeder
│   │   │   ├── controller/          # REST Endpoints (User, Restaurant, Order, Reservation, etc.)
│   │   │   ├── dto/                 # Request/Response payloads
│   │   │   ├── model/               # JPA Entity Definitions (User, MenuItem, FoodOrder, etc.)
│   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   ├── service/             # Business Logic (Otp, RateLimiter, SessionAuth)
│   │   │   └── util/                # Security sanitizers and formatters
│   │   └── main/resources/
│   │       ├── application.properties # Spring configuration & environment mappings
│   │       └── templates/           # Server-side HTML templates (if any)
│   ├── Dockerfile                   # Multi-stage Docker deployment config
│   └── pom.xml                      # Maven project dependencies
│
└── README.md                        # This project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [Java Development Kit (JDK)](https://adoptium.net/) (v17 or higher)
- [Maven](https://maven.apache.org/) (optional, wrappers are included)
- [Docker](https://www.docker.com/) (optional, for containerized running)

---

### 1. Setting Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd tastematch-backend-1
   ```

2. Configure environment variables (Optional). You can create an `.env` file or export them directly in your shell. The default values in `application.properties` are ready for zero-config local development:
   ```properties
   # Database Configuration (defaults to H2 file-based)
   APP_DB_URL=jdbc:h2:file:./data/tastematchdb
   APP_DB_USERNAME=sa
   APP_DB_PASSWORD=

   # Port & Security
   PORT=8080
   APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
   APP_H2_CONSOLE_ENABLED=true

   # Transactional Mail (Required for real email notifications)
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=no-reply@yourdomain.com
   ```

3. Build and run the Spring Boot application:
   - **Using Maven Wrapper (Windows):**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **Using Maven Wrapper (macOS/Linux):**
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```

The backend server will start at **`http://localhost:8080`**.
You can access the in-memory H2 Console at **`http://localhost:8080/h2-console`** (JDBC URL: `jdbc:h2:file:./data/tastematchdb`, User: `sa`, Password: empty).

---

### 2. Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd tastematch-frontend
   ```

2. Configure environment variables. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` as needed:
   ```properties
   REACT_APP_API_BASE_URL=http://localhost:8080
   REACT_APP_ENABLE_DEMO_FALLBACK=true
   ```
   *Note: If the backend is not running, set `REACT_APP_ENABLE_DEMO_FALLBACK=true` to run the frontend in fully simulated interactive demo mode.*

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Start the local development server:
   ```bash
   npm start
   ```

Your browser will automatically open to **`http://localhost:3000`**.

---

## 🐳 Running with Docker

Eativo is fully dockerized for easy distribution. The backend utilizes a multi-stage Docker build to minimize container size.

1. **Build the Backend Image:**
   ```bash
   cd tastematch-backend-1
   docker build -t eativo-backend .
   ```

2. **Run the Backend Container:**
   ```bash
   docker run -d -p 8080:8080 --name eativo-backend-service \
     -e APP_H2_CONSOLE_ENABLED=true \
     -e SENDGRID_API_KEY=your_key \
     eativo-backend
   ```

---

## 🍽️ Seeded Demo Data

Upon initial startup, the backend automatically seeds the database with pre-configured dining spots, enabling you to test the platform immediately:

| Restaurant Name | Cuisine | Location | Average Price Range |
| :--- | :--- | :--- | :--- |
| **Paradise Biryani** | Hyderabadi | Secunderabad | Rs 900 |
| **Shah Ghouse Cafe** | Mughlai | Tolichowki | Rs 850 |
| **Chutneys** | South Indian | Banjara Hills | Rs 700 |
| **Bawarchi** | Hyderabadi | RTC Cross Roads | Rs 800 |
| **Pista House** | Hyderabadi | Charminar | Rs 950 |
| **Meridian** | Multi-Cuisine | Panjagutta | Rs 1000 |
| **Cafe Bahar** | Hyderabadi | Basheerbagh | Rs 780 |
| **Mehfil** | Indian | Narayanguda | Rs 720 |

### Default Test Credentials:
- **Aarav:** `aarav@tastematch.local` / Password: `demo12345`
- **Sana:** `sana@tastematch.local` / Password: `demo12345`
- **Riya:** `riya@tastematch.local` / Password: `demo12345`

---

## 🛡️ License & Contributions
This project was developed as a modern demonstration of rich client animations coupled with robust, secured backend APIs. Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

Licensed under the [MIT License](LICENSE).
