*This project has been created as part of the 42 curriculum by tpinarli, mchoi, trpham and donheo.*

# PlantBee

## Description

PlantBee is a smart plant monitoring and care ecosystem designed to empower the Hive Helsinki community to care for collective greenery through IoT integration and real-time data. It connects ESP32-based soil sensors to a high-performance Go backend, encouraging users to take immediate action when a plant is thirsty based on live, reliable metrics.

The primary objective of PlantBee is to foster Hive Helsinki community-driven plant care through live data. By leveraging real-time sensor telemetry, the system monitors soil moisture and sensor health to ensure no plant is left thirsty. When a plant's vitals drop, the system generates actionable tasks, encouraging community members to intervene and provide care based on reliable, live information.

### Key Features
- **IoT Integration**: Seamless ingestion of sensor readings (moisture, battery) from ESP32 devices via a RESTful API.
- **Intelligent Monitoring**: A background engine detects anomalies like "Sudden Drop" (sensor dislodged) and "Radio Silence" (offline sensors).
- **Self-Healing Task Lifecycle**: Watering tasks are automatically generated when soil is dry and self-resolve once the sensor detects a rise in moisture.
- **42 Intra Authentication**: Secure user management and login via the 42 OAuth provider.
- **Volunteer System**: A gamified "Help to Help" system where users can accept tasks to care for plants and earn "points."
- **Modern Dashboard**: A responsive React 19 interface featuring detailed plant profiles, real-time metrics, and a task leaderboard.
- **Infrastructure as Code**: Cloud-ready deployment configurations using AWS CDK.

### Hardware
- **Microcontroller**: ESP32-S3 (or compatible).
- **Sensor**: Capacitive Soil Moisture Sensor v1.2 (corrosion-resistant).
- **Communication**: Wi-Fi (HTTP/JSON).

## Instructions

### Prerequisites
To run this project locally, you will need:
- **Docker**: Version 20.10 or higher.
- **Docker Compose**: Version 2.0 or higher.
- **42 API Account**: Access to [profile.intra.42.fr](https://profile.intra.42.fr) to create an OAuth application.

### Step-by-Step Setup

1.  **Register a 42 OAuth App**:
    - Log in to [profile.intra.42.fr](https://profile.intra.42.fr).
    - Navigate to **Settings → API → Register a new app**.
    - Set the **Redirect URI** to `http://localhost:8080/auth/callback`.
    - Note down your **UID** (`CLIENT_ID`) and **Secret** (`CLIENT_SECRET`).

2.  **Clone the Repository**:
    ```bash
    git clone https://github.com/tarikpinarli/plantbee.git
    cd plantbee
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in `backend/server/.env`:
    ```env
    # 42 OAuth Credentials
    CLIENT_ID=your_42_uid_here
    CLIENT_SECRET=your_42_secret_here
    REDIRECT_URI=http://localhost:8080/auth/callback

    # Server Configuration
    PORT=8080
    SESSION_SECRET=choose_a_long_random_string

    # Database Configuration
    DATABASE_URL=postgres://postgres:postgres@db:5432/plantbee?sslmode=disable
    ```

4.  **Run the Stack**:
    Launch all services (Backend, Frontend, Database, Adminer) with a single command:
    ```bash
    docker-compose up --build
    ```

### Accessing the Services
| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Main user interface (React) |
| **App** | [http://localhost:8080](http://localhost:8080) | Go REST API |
| **Adminer** | [http://localhost:8081](http://localhost:8081) | Database browser UI |

---

## Resources

### Documentation & References
- **Frontend**: [React 19 Documentation](https://react.dev/), [TanStack Router](https://tanstack.com/router/latest), [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta).
- **Backend**: [Go-Chi Router](https://go-chi.io/), [Go OAuth2 Package](https://pkg.go.dev/golang.org/x/oauth2).
- **Authentication**: [42 API Guide](https://api.intra.42.fr/doc).
- **Infrastructure**: [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/v2/guide/home.html).
- **IoT**: [ESP32 Deep Sleep and Battery Life](https://lastminuteengineers.com/esp32-deep-sleep-tutorial/).

### Use of Artificial Intelligence
AI tools were used in this project primarily for educational purposes and as a learning assistant:
- **Docker Containerizing**: Provided extensive guidance on containerizing the application services (Go Backend, React Frontend, and PostgreSQL) to create a consistent development and deployment environment.
- **Concept Understanding**: Used to ask general questions about system architecture and how the various microservices interact with each other.
- **Troubleshooting**: Used to help understand the meaning of standard error logs when services failed to start or when Docker networking issues occurred, which helped in finding the correct solution faster.
- **Documentation**: Used to review the project documentation to ensure it was clear, grammatically correct, and easy to read.

## Technical Choices
- **Go (Golang)**: Chosen for its performance, concurrency primitives (goroutines for background monitoring), and small binary size.
- **React 19**: Leveraged for the latest frontend features like improved hook handling and performance optimizations.
- **PostgreSQL**: Reliable relational database for storing plant telemetry, user history, and task states.
- **Docker**: Ensures a consistent development environment across different machines, critical for 42 curriculum peer evaluation.

## Project Structure
```text
.
├── backend/            # Go Backend source code
│   └── server/         # API, Business Logic, and Database queries
├── client/             # React 19 Frontend (Vite + TypeScript)
├── infra/              # AWS CDK Infrastructure as Code
├── visuals/            # Design assets and screenshots
├── docker-compose.yml  # Orchestrates all services
└── Taskfile.yml        # Development task runner
```