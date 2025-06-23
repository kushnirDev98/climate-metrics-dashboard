# Climate Metrics Dashboard

Welcome to the **Climate Metrics Dashboard**, a web application designed to visualize temperature data as candlestick charts for various cities. Built with a modern tech stack, this project allows users to select a city and view real-time climate metrics for the current day (June 24, 2025). The backend provides a RESTful API to aggregate and serve climate data, while the frontend offers an interactive and responsive interface.

## Overview

- **Purpose**: Display hourly temperature candlestick charts for available cities for today.
- **Technologies**:
  - **Frontend**: React, TypeScript, Tailwind CSS, ApexCharts
  - **Backend**: Fastify, TypeBox, Node.js
  - **Testing**: Jest
- **Current Date**: June 24, 2025
- **Status**: Under active development with core functionality implemented.

## Project Structure

```
Inovecs/
├── client/                  # Frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components (e.g., ClimateMetricsChart, ErrorMessage)
│   │   ├── contexts/        # Context providers (e.g., AuthContext)
│   │   ├── types/           # TypeScript type definitions (e.g., ClimateMetric.types)
│   │   ├── api/             # API client functions (e.g., fetchClimateMetrics)
│   │   ├── App.tsx          # Main application component with city dropdown
│   │   └── index.tsx        # Entry point
│   ├── package.json         # Frontend dependencies and scripts
│   └── tailwind.config.js   # Tailwind CSS configuration
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
├── README.md                # This file
└── .gitignore               # Git ignore file
```

### Key Files
- **`client/src/App.tsx`**: Main frontend component with a dropdown for city selection and chart rendering.
- **`client/src/components/ClimateMetricsChart.tsx`**: Renders the candlestick chart using ApexCharts.
- **`server/src/modules/climateMetric/ClimateMetricAggregator.service.ts`**: Aggregates climate data into hourly candlesticks.
- **`server/src/modules/climateMetric/climateMetricRoutes.ts`**: Defines the Fastify API endpoint (`/api/climate-metrics/:city`).

## Installation

### Prerequisites
- Node.js (v18 or later)
- pnpm (recommended for package management)

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
   - Create a `.env` file in the `server` directory with:
     ```
     NODE_ENV=development
     PORT=3000
     ```
   - Ensure authentication tokens are configured if using `authMiddleware`.

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
   - The app automatically fetches and displays today's temperature data (June 24, 2025) as a candlestick chart.

2. **View Data**:
   - The chart shows hourly open, high, low, and close temperatures.
   - A loading indicator appears during data fetch, and errors are displayed if they occur.

3. **Interact**:
   - Hover over candlesticks to see detailed tooltip data.
   - The chart is styled with a gradient background and responsive design.

## Testing

- **Run Tests**:
  - Navigate to the `server` directory and run:
    ```bash
    pnpm test
    ```
  - This executes Jest tests for the `ClimateMetricAggregatorService`.

## Future Improvements

- **Code improvements**:
  - Use the whole advantages of fastify such as plugins and decorators.
  - Refactor the code to use Fastify's built-in validation and serialization features.
  - Implement better error handling.
  - Add more unit tests for the backend services.
  - Implement dependency injection for better testability and modularity.
  - Set up seed data for testing purposes.

- **Add persistent storage for Data**:
  - Add functionality for saving data in Database.
  
- **Real-Time Data Updates**:
  - Implement WebSocket or polling to update charts in real-time as new climate events arrive.
  
- **Additional Metrics**:
  - Consider windspeed metric and implement appropriate visualisation.

- **Historical Data**:
  - Add time range and add functionality for viewing it on the chart.

- **Authentication**:
  - Implement user authentication flow with JWT or OAuth.
  - Expand `authMiddleware` to include user roles or API key validation.

- **Data Export**:
  - Add a feature to export chart data as CSV or PDF.

- **Error Recovery**:
  - Implement retry logic for failed API calls and a fallback UI for no data.

- **Deployment**:
  - Set up CI/CD pipelines for automated testing and deployment using AWS and GithubActions.

- **Performance Optimization**:
  - Use lazy loading for charts and implement data sampling for large datasets.