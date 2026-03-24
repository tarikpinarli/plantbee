# PlantBee 🌱🐝

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

# Used libraries
- Tanstack router: Type safe router, maybe we might have a learning curve and more initial setup than React router.
gives us autocompletes / detects errors
- Tanstack query: used to be called React query.
- Zod: TS schema validation library
- Shadcn/ui: Open code for accessible lightweight UI. We can install only exactly what we want, instead of getting a whole library.

## How to run
```pnpm dev```


<!-- ## run docker for frontend
```docker build --no-cache -t transcendent-frontend .```

```docker run -d -p 3000:80 --name frontend-test transcendent-frontend``` -->

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