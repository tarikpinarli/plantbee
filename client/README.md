# PlantBee Client 🌱🐝

This is the React + TypeScript + Vite frontend client for the PlantBee application.

## Used Libraries
- **Tanstack Router:** Type-safe router with autocompletes and error detection.
- **Tanstack Query:** Powerful data synchronization and state management.
- **Zod:** TypeScript-first schema validation.
- **Shadcn/ui:** Accessible, lightweight UI components.

## How to Run

### Using Docker (Recommended)
This client is designed to run seamlessly with the Go backend inside Docker.
From the **root of the project** (not this folder), run:
```bash
docker-compose up --build
```
Vite will automatically launch on `http://localhost:5173` with hot-reloading enabled, and proxy all API requests natively to the Go backend.

### Running Locally (Without Docker)
If you want to run just the UI without Docker:
```bash
pnpm install
pnpm dev
```

# Plant form flow diagram 
 ┌─────────────────────────────┐
 │        User Input           │
 │ (typing in input fields)    │
 └─────────────┬───────────────┘
               │
               ▼
 ┌─────────────────────────────┐
 │       handleChange()        │
 │ - Updates `form[field]`     │
 │ - Clears `errors[field]`    │
 └─────────────┬───────────────┘
               │
               ▼
 ┌─────────────────────────────┐
 │        form State           │
 │ {                          │
 │   name: "",                 │
 │   species: "",              │
 │   pot_volume_l: 0,          │
 │   ...                       │
 │ }                           │
 └─────────────┬───────────────┘
               │
               ▼
 ┌─────────────────────────────┐
 │        handleSubmit()       │
 │ - Prevents default reload   │
 │ - Calls validate()          │
 └─────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
 ┌──────────────┐  ┌───────────────┐
 │ validate()   │  │ buildPayload()│
 │ - Checks for │  │ - Converts    │
 │   missing    │  │   form fields │
 │   required   │  │   to JSON     │
 │   fields     │  │ - Ensures     │
 │ - Updates    │  │   correct     │
 │   errors     │  │   types       │
 └─────┬────────┘  └───────┬───────┘
       │                   │
       ▼                   ▼
  ┌───────────┐     ┌────────────────┐
  │ errors[]  │     │ payload JSON   │
  │ for fields│     │ to send to API │
  └────┬──────┘     └───────────────┘
       │                   │
       ▼                   ▼
  ┌─────────────────────────────┐
  │    API Call (fetch POST)    │
  │ - Sets status='loading'     │
  │ - Sends payload JSON        │
  │ - On success → status='success' │
  │ - On failure → status='error'   │
  └───────────────┬─────────────┘
                  │
                  ▼
      ┌─────────────────────────┐
      │ UI Feedback / Rendering │
      │ - Show success message  │
      │ - Show error messages   │
      │ - Reset form if success │
      └─────────────────────────┘