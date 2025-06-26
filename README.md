# Climate Metrics Dashboard

Welcome to the **Climate Metrics Dashboard**, a web application designed to visualize hourly temperature data as candlestick charts for various cities. This project provides an interactive and responsive interface for users to select a city and view real-time climate metrics for the current day (June 24, 2025). The backend delivers a RESTful API to aggregate and serve climate data, ensuring scalability and maintainability.

## Overview

- **Purpose**: Display hourly temperature candlestick charts for cities (e.g., Berlin, NewYork, Tokyo, SaoPaulo, CapeTown) for the current day.
- **Current Date**: June 24, 2025
- **Status**: Under active development with core functionality implemented.

## Technology Stack

- **Frontend**:
    - **React**: JavaScript library for building interactive user interfaces.
    - **TypeScript**: Adds static types to JavaScript for improved developer experience and code reliability.
    - **Tailwind CSS**: Utility-first CSS framework for rapid and responsive styling.
    - **ApexCharts**: Library for rendering interactive candlestick charts.
    - **Vite**: Build tool for fast development and optimized production builds.
- **Backend**:
    - **Fastify**: High-performance Node.js web framework for building RESTful APIs.
    - **TypeBox**: TypeScript-based schema builder for request/response validation.
    - **Node.js**: Runtime for executing server-side JavaScript.
- **Testing**:
    - **Jest**: Testing framework for unit and integration tests.
- **Package Management**:
    - **pnpm**: Fast, disk-space-efficient package manager.
- **Deployment**:
    - **AWS S3**: Hosts the static frontend build.
    - **AWS EC2** (or similar): Hosts the backend API (assumed for this setup; adjust if using other services like ECS or Lambda).
    - **GitHub Actions**: Automates CI/CD pipelines for testing and deployment.
- **Development Tools**:
    - **PostCSS** and **Autoprefixer**: Process Tailwind CSS and ensure cross-browser compatibility.
    - **ESLint** and **Prettier**: Enforce code quality and consistent formatting.

## Architecture Approach

The application follows a **client-server architecture** with a clear separation of concerns to ensure modularity, scalability, and maintainability:

- **Frontend (Client)**:
    - Built with **React** and **TypeScript**, the frontend is a single-page application (SPA) that communicates with the backend via RESTful API calls.
    - **Component-Based Design**: Reusable components (`ClimateMetricsChart`, `ErrorMessage`) promote code reusability and maintainability.
    - **Context API**: Manages global state (e.g., `AuthContext` for authentication tokens) to simplify data sharing across components.
    - **Responsive UI**: Tailwind CSS ensures a mobile-friendly, visually appealing interface with minimal custom CSS.
    - **Data Fetching**: The `fetchClimateMetrics` function handles API requests, with error handling and loading states to enhance user experience.
    - **Visualization**: ApexCharts renders interactive candlestick charts, displaying hourly temperature data (open, high, low, close).

- **Backend (Server)**:
    - Built with **Fastify** and **Node.js**, the backend provides a lightweight, high-performance API.
    - **Modular Structure**: Organized into modules (e.g., `climateMetric`) with dedicated routes (`climateMetricRoutes.ts`) and services (`ClimateMetricAggregator.service.ts`) for data processing.
    - **Type Safety**: **TypeBox** ensures robust request/response validation, reducing runtime errors.
    - **Middleware**: Authentication middleware (`auth.middleware`) secures API endpoints, with potential for JWT or API key validation.
    - **Data Aggregation**: The `ClimateMetricAggregator` service processes raw climate data into hourly candlestick format, optimized for chart rendering.

- **Separation of Concerns**:
    - The frontend focuses on user interaction and visualization, while the backend handles data aggregation and API logic.
    - Loose coupling between client and server allows independent scaling and updates.

- **Scalability**:
    - The stateless REST API supports horizontal scaling (e.g., via AWS ECS or multiple EC2 instances).
    - The frontend, hosted on S3, leverages AWS’s global CDN (CloudFront) for low-latency delivery.

- **Extensibility**:
    - The modular backend design allows easy addition of new metrics (e.g., windspeed) or endpoints.
    - The frontend’s component-based architecture supports new features like historical data or data export.

## Project Structure

```
climate-metrics-dashboard/
├── client/                  # Frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components (e.g., ClimateMetricsChart, ErrorMessage)
│   │   ├── contexts/        # Context providers (e.g., AuthContext)
│   │   ├── types/           # TypeScript type definitions (e.g., ClimateMetric.types)
│   │   ├── api/             # API client functions (e.g., fetchClimateMetrics)
│   │   ├── App.tsx          # Main application component with city dropdown
│   │   ├── index.tsx        # Entry point
│   │   └── index.css        # Tailwind CSS directives
│   ├── package.json         # Frontend dependencies and scripts
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── vite.config.ts       # Vite configuration
├── server/                  # Backend application
│   ├── src/
│   │   ├── common/          # Common middleware (e.g., auth.middleware)
│   │   ├── modules/
│   │   │   ├── climateMetric/  # Climate metric module
│   │   │   │   ├── ClimateMetricAggregator.service.ts  # Data aggregation logic
│   │   │   │   ├── climateMetricRoutes.ts             # API routes
│   │   │   │   └── ClimateMetric.types.ts             # Type definitions
│   │   ├── services/        # Service layer (e.g., Logger.service, Config.service)
│   │   └── index.ts         # Server entry point
│   ├── package.json         # Backend dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration
├── .github/                 # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline configuration
├── README.md                # This file
└── .gitignore               # Git ignore file
```

### Key Files
- **`client/src/App.tsx`**: Main frontend component with a dropdown for city selection and chart rendering.
- **`client/src/components/ClimateMetricsChart.tsx`**: Renders candlestick charts using ApexCharts.
- **`client/src/index.css`**: Includes Tailwind CSS directives for styling.
- **`server/src/modules/climateMetric/ClimateMetricAggregator.service.ts`**: Aggregates climate data into hourly candlesticks.
- **`server/src/modules/climateMetric/climateMetricRoutes.ts`**: Defines the Fastify API endpoint (`/api/climate-metrics/:city`).
- **`.github/workflows/deploy.yml`**: GitHub Actions workflow for automated deployment to AWS S3.

## Installation

### Prerequisites
- **Node.js**: v22 or later
- **pnpm**: v8 or later (recommended for package management)
- **AWS CLI**: Configured with credentials for S3 access
- **GitHub Account**: For setting up GitHub Actions

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/climate-metrics-dashboard.git
   cd climate-metrics-dashboard
   ```

2. **Install Dependencies**:
    - For the client:
      ```bash
      cd client
      pnpm install
      ```
    - For the server:
      ```bash
      cd ../server
      pnpm install
      ```

3. **Set Up Environment Variables**:
    - **Client**: Create a `.env` file in the `client` directory (if needed for API base URL):
      ```
      VITE_API_URL=http://localhost:3000
      ```
    - **Server**: Create a `.env` file in the `server` directory:
      ```
      NODE_ENV=development
      PORT=3000
      ```
    - Ensure authentication tokens are configured for `authMiddleware`.

4. **Run the Applications**:
    - Start the server:
      ```bash
      cd server
      pnpm start
      ```
    - Start the client:
      ```bash
      cd ../client
      pnpm dev
      ```

5. **Access the Dashboard**:
    - Open `http://localhost:5173` in your browser to view the dashboard.

## Usage

1. **Select a City**:
    - Use the dropdown to choose a city (e.g., Berlin, NewYork, Tokyo, SaoPaulo, CapeTown).
    - The app fetches and displays today's temperature data (June 24, 2025) as a candlestick chart.

2. **View Data**:
    - The chart shows hourly open, high, low, and close temperatures.
    - A loading indicator displays during data fetch, with error messages for failed requests.

3. **Interact**:
    - Hover over candlesticks for detailed tooltip data.
    - The UI features a gradient background and responsive design via Tailwind CSS.

## Testing

- **Run Tests**:
    - In the `server` directory:
      ```bash
      pnpm test
      ```
    - Executes Jest tests for `ClimateMetricAggregatorService`.
    - Client-side tests can be added using Jest or React Testing Library.

## Deployment Plan

The client is deployed to **AWS S3** for static hosting, with **GitHub Actions** automating the CI/CD pipeline. The backend is assumed to be hosted on **AWS EC2** (or ECS/Lambda, depending on your setup—adjust as needed).

### Client Deployment (AWS S3)

1. **Set Up S3 Bucket**:
    - Create an S3 bucket (e.g., `climate-metrics-dashboard-client`) in your AWS account.
    - Enable **Static Website Hosting** in the bucket settings.
    - Set the bucket policy to allow public read access:
      ```json
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::climate-metrics-dashboard-client/*"
          }
        ]
      }
      ```
    - Optionally, configure **CloudFront** for CDN distribution and HTTPS.

2. **Configure GitHub Actions**:
    - Create a `.github/workflows/deploy.yml` file in the repository root.
    - Add AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) as secrets in your GitHub repository settings.

3. **Build and Deploy**:
    - The `pnpm build` command generates a `dist` folder in the `client` directory.
    - GitHub Actions syncs the `dist` folder to the S3 bucket on each push to the `main` branch.
    - Access the app via the S3 bucket’s static website endpoint (e.g., `http://climate-metrics-dashboard-client.s3-website-us-east-1.amazonaws.com`).

### Backend Deployment (Assumed AWS EC2)

1. **Set Up EC2 Instance**:
    - Launch an EC2 instance with Node.js and `pnpm` installed.
    - Clone the repository and install server dependencies:
      ```bash
      cd server
      pnpm install
      ```

2. **Configure Environment**:
    - Set up `.env` with production settings (e.g., `NODE_ENV=production`, `PORT=3000`).
    - Use a process manager like **PM2**:
      ```bash
      pnpm global add pm2
      pm2 start dist/index.js --name climate-metrics-server
      ```

3. **GitHub Actions for Backend**:
    - Add a workflow to deploy the backend to EC2 (or ECS/Lambda) if needed. For EC2, use SSH to sync files:
    - Add `EC2_HOST`, `EC2_USERNAME`, and `EC2_SSH_KEY` as GitHub secrets.

4. **Networking**:
    - Configure EC2 security groups to allow inbound traffic on port 3000 (or your chosen port).
    - Optionally, use an **Application Load Balancer** or **API Gateway** for scalability.

## Future Improvements

- **Code Improvements**:
    - Leverage Fastify plugins and decorators for better modularity.
    - Use Fastify’s built-in validation and serialization with TypeBox.
    - Enhance error handling with custom error types.
    - Expand unit tests for backend services and add frontend tests.
    - Implement dependency injection for testability.
    - Set up seed data for testing.

- **Persistent Storage**:
    - Integrate a database (e.g., AWS RDS or DynamoDB) for storing climate data.

- **Real-Time Updates**:
    - Use WebSockets or polling for live chart updates.

- **Additional Metrics**:
    - Add windspeed or humidity metrics with appropriate visualizations.

- **Historical Data**:
    - Implement time range selection for viewing historical data on charts.

- **Authentication**:
    - Expand `authMiddleware` with JWT or OAuth for user authentication.

- **Data Export**:
    - Enable exporting chart data as CSV or PDF.

- **Error Recovery**:
    - Add retry logic for API failures and a fallback UI for no data.

- **Performance Optimization**:
    - Implement lazy loading for charts and data sampling for large datasets.
