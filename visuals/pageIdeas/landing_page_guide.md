# Frontend Implementation Guide: Landing Page

**Page Name:** Landing Page (Home)
**React Route:** `/` (configured in `frontend/src/app/router.tsx`)

## Overview
The Landing Page is the first thing users see when they visit PlantBee. It serves as the public face of the application and handles the entry point for authentication. Since the app is an SPA (Single-Page Application), this page must load instantly and guide users smoothly into the 42 Intra login flow.

## Required Visual Elements
*   **Hero Section:** Catchy title (e.g., "Welcome to PlantBee 🐝") and a short description explaining what the app does.
*   **Background/Aesthetics:** Use a soft, plant-themed background (e.g., light green gradients, or a blurred image from `visuals/hive_campus_images/`). Keep it clean and modern using Tailwind CSS.
*   **Call to Action (CTA):** A prominent **"Login with 42"** button that stands out from the rest of the page.
*   **Features Overview (Optional but recommended):** Brief icons/text about what the app offers (tracking soil moisture, volunteer watering, etc.).

## Backend Integration & Data Flow

### 1. Authentication Button (The CTA)
When the user clicks the "Login with 42" button, the frontend does **not** need to handle any complex OAuth logic itself. 

*   **Action:** Simply wrap the button in an anchor tag pointing directly to the backend login route, or use `window.location.href`.
*   **Endpoint:** `GET /auth/login`
*   **How it works:** 
    ```html
    <!-- Example Implementation -->
    <a href="/auth/login" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
      Login with 42
    </a>
    ```
    *Note: Because we have the Vite proxy running locally, navigating to `/auth/login` correctly hits our Go backend. The backend will instantly redirect the browser to the official 42 Intra authorization page.*

### 2. Post-Login Redirection (What happens next)
After the user logs in via 42, the backend automatically issues a secure cookie and redirects them back to our application. You do not need to fetch tokens or manage localStorage for auth.

*   **If it is the user's first time:** The backend redirects them to `/welcome`. Your routing must capture this and display the Welcome Page component.
*   **If they are a returning user:** The backend redirects them to `/dashboard`. Your routing must capture this display the Dashboard Page component.

## Best Practices for this Page
*   **No API Fetching:** There is no dynamic JSON data to load on this specific page (no plants, no user profile). Do not make any `fetch()` or `useQuery` calls here.
*   **Performance:** Keep this component lightweight so the initial load is blazing fast.
*   **Responsiveness:** Ensure the CTA button and text scale properly on mobile devices using Tailwind's responsive prefixes (e.g., `md:text-left`, `flex-col md:flex-row`).

---
*If you have any questions or the backend route behaves unexpectedly, reach out to the backend team!*
