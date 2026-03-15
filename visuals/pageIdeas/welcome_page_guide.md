# Frontend Implementation Guide: Welcome Page

**Page Name:** Welcome Page
**React Route:** `/welcome`

## Overview
This page is shown *only once* to new users immediately after they log in via 42 Intra for the very first time. It is a crucial onboarding step specifically designed to capture the user's intent: do they want to actively volunteer to water plants, or do they just want to observe the dashboard?

## Required Visual Elements
*   **Greeting:** "🎉 Welcome to PlantBee!"
*   **Context Text:** Let them know this is their first time logging in and ask how they plan to use the system.
*   **Role Selection Buttons:**
    *   **Volunteer Button:** Prominent, exciting styling (e.g., "🧑‍🌾 I want to be a Volunteer").
    *   **Observer Button:** Secondary, more subdued styling (e.g., "👀 I am just observing").

## Backend Integration & Data Flow

### 1. Submitting the User's Choice
When the user clicks either button, the frontend must send an API request to the Go backend to permanently save their preference.

*   **Endpoint:** `POST /api/user/welcome`
*   **JSON Payload to Send:**
    ```json
    {
      "intend_to_help": true // (or false if they clicked Observer)
    }
    ```
*   **Expected Response:** `200 OK`

### 2. Handling the Response (Redirection)
Once you receive a successful `200 OK` from the `fetch()` or `useMutation` call, the frontend must immediately redirect the user to the main dashboard.

*   **Action:** Use React Router's `useNavigate` hook.
*   **Code Example:**
    ```tsx
    const navigate = useNavigate();
    // ... after successful API call
    navigate('/dashboard');
    ```

## Edge Cases to Handle
*   **Network Errors:** If the `POST` request fails (e.g., 500 error), display a small error toast or alert letting the user know their choice wasn't saved, and don't redirect them yet.
