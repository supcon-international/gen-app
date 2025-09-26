# Project Specification Document for Industrial Dashboard

## 1. Background

### User Story
As a factory manager at a metal factory, I need a dashboard that provides real-time data and visualizations of the production processes. This will help me monitor production efficiency, manage resources, and make informed decisions swiftly.

### Business Scenario
In the metal factory, various production lines are responsible for manufacturing different components. There is a need for a centralized dashboard that integrates data from multiple systems, such as production lines, inventory, workforce, and scheduling. The dashboard should present this data in a user-friendly manner, allowing for real-time monitoring and decision-making.

## 2. Functional Requirements

### Pages/Modules → Components → Behaviors/States → Events/Side Effects

#### Dashboard Module
- **Component: Real-time Data Display**
  - **Behaviors/States:**
    - Shows current production status, inventory levels, and workforce availability.
    - Updates in real-time as new data is published.
  - **Events/Side Effects:**
    - On data update, refresh the UI component to reflect new data.

- **Component: Data Visualization**
  - **Behaviors/States:**
    - Visual graphs and charts representing production metrics, downtime, and inventory levels.
    - Historical data comparison over specified time frames.
  - **Events/Side Effects:**
    - On user selection of date range, fetch historical data and update visualizations.

#### Inventory Module
- **Component: Inventory Overview**
  - **Behaviors/States:**
    - Display current inventory levels for materials (S1 to S5, W1 to W3).
    - Show allocated vs. on-hand quantities.
  - **Events/Side Effects:**
    - On data update from the inventory topic, refresh inventory display.

#### Production Status Module
- **Component: Job Queue Overview**
  - **Behaviors/States:**
    - Display job statuses for each production step (CUTWIRE, COLD, THREAD, etc.).
    - Indicate queued, running, and completed jobs.
  - **Events/Side Effects:**
    - On job completion, update the respective job status and notify users.

#### Workforce Module
- **Component: Workforce Availability**
  - **Behaviors/States:**
    - Show current headcount per shift for each operator group (OP_CUT, OP_COLD, etc.).
  - **Events/Side Effects:**
    - Upon changes in workforce state, refresh workforce display.

### Functional Requirements Details

| Component                    | Subscribe Topics                                              | Publish Topics                  |
|------------------------------|--------------------------------------------------------------|---------------------------------|
| Real-time Data Display       | v1/FY-Fab/sched/state/queue-snapshot                        |                                 |
| Data Visualization           | v1/FY-Fab/warehouse/state/inventory-S1 to S5, W1 to W3     |                                 |
| Inventory Overview           | v1/FY-Fab/warehouse/state/inventory-S1 to S5, W1 to W3     |                                 |
| Job Queue Overview           | v1/FY-Fab/sched/state/queue-snapshot                        |                                 |
| Workforce Availability        | v1/FY-Fab/workforce/state/workgroup-OP_CUT to OP_HEAT      |                                 |

## 3. Data & UNS Mapping

### Subscribe/Publish Patterns

- **Real-time Data Display**
  - Subscribe to `v1/FY-Fab/sched/state/queue-snapshot` for job queue updates.
  - Subscribe to inventory topics `v1/FY-Fab/warehouse/state/inventory-*` for material availability.

- **Data Visualization**
  - Subscribe to relevant production metrics and inventory states to visualize trends.

- **Inventory Overview**
  - Subscribe to `v1/FY-Fab/warehouse/state/inventory-*` for real-time inventory levels.

- **Job Queue Overview**
  - Subscribe to `v1/FY-Fab/sched/state/queue-snapshot` to get job statuses.

- **Workforce Availability**
  - Subscribe to `v1/FY-Fab/workforce/state/workgroup-*` to get the current workforce states.

### Parsing/Validation Rules
- Ensure that incoming messages conform to the defined schema for each topic.
- Validate data types (e.g., quantities should be numeric, IDs should follow specific patterns).

### Trigger Conditions
- Refresh UI components when new data arrives on subscribed topics.
- Trigger alerts for low inventory levels or production bottlenecks.

### Exception/Alarm Strategies
- Log errors if data parsing fails.
- Notify users if critical data is not received within a certain timeframe (e.g., no updates for 5 minutes).

### Reconnection/Fallback Strategies
- Implement a retry mechanism to reconnect to MQTT broker upon disconnection.
- Use local caching to display the last known good state if live data is unavailable.

---

This specification provides a comprehensive overview of the requirements for building a real-time dashboard for a metal factory, focusing on data integration, visualization, and user engagement through real-time updates.