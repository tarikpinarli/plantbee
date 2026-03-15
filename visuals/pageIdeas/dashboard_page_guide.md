# Frontend Implementation Guide: Dashboard Page

**Page Name:** Dashboard Page
**React Route:** `/dashboard`

## Overview
The Dashboard is the core of the PlantBee application. This is where users see the real-time status of all plants, view any active watering tasks, and (if they are a volunteer) accept tasks. This page will be data-heavy and requires fetching multiple pieces of information from the Go backend.

## Required Visual Elements
*   **User Header:** A small profile section showing the user's 42 picture and their current `water_count` score.
*   **Plant Grid:** A responsive grid/list of plant cards. Each card should show:
    *   Plant Image, Name, and Category
    *   Current Moisture vs Target Moisture (ideally a visual progress bar or color-coded status)
*   **Active Tasks Section:** A clear, prioritized list of plants that currently need watering.
*   **Logout Button:** A simple way to end the session.

## Backend Integration & Data Flow

### 1. Fetching Plants Data
You will need to fetch the list of all plants to populate the main grid.
*   **Endpoint:** `GET /plants` (Assuming this endpoint is built, confirm with backend team)
*   **Action:** Use `useQuery` from TanStack Query to fetch and cache this list. Ensure you handle loading and error states gracefully while waiting for the JSON response.

### 2. Fetching User Profile
You will need to know if the current user `intend_to_help` in order to show or hide the "Accept Task" buttons.
*   **Endpoint:** `GET /api/user/profile` (Confirm with backend team)
*   **Usage:** If `intend_to_help` is true, render the interactive task buttons. If false, just show the plant statuses.

### 3. Accepting a Watering Task (Volunteer Action)
If a plant is thirsty, a volunteer can click an "Accept Task" button.
*   **Endpoint:** `POST /api/tasks/accept`
*   **JSON Payload Expected:**
    ```json
    {
      "id": 12 // The Task ID
    }
    ```
*   **Action:** Triggers a `useMutation` that updates the backend, and then automatically invalidates the plants/tasks query to refresh the UI so everyone else sees the task is claimed!

### 4. Logging Out
This is extremely simple, much like the login flow.
*   **Endpoint:** `GET /auth/logout`
*   **Action:** Simply use an `<a>` tag or `window.location.href = '/auth/logout'` to hit the backend route. The backend will destroy the secure cookie and automatically redirect the user back to the `/` landing page.
