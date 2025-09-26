# Project Specification Document

## 1. Background

### User Story
As a factory manager at a metal factory, I want to monitor all devices in real-time through a dashboard so that I can track production efficiency, inventory levels, and equipment status, allowing for timely decision-making and improved operational management.

### Business Scenario
In a competitive manufacturing environment, operational efficiency is critical. The metal factory needs a comprehensive dashboard that aggregates data from various devices and systems, allowing the manager to visualize real-time metrics and make informed decisions quickly. This dashboard will integrate seamlessly with the existing UNS/MQTT system, ensuring that critical data is available at the manager's fingertips.

---

## 2. Functional Requirements

### 2.1 Pages/Modules

#### Module: Dashboard

- **Components:**
  - Real-Time Data Visualization
  - Inventory Status Display
  - Machine Status Overview
  - Production Jobs Tracking

- **Behaviors/States:**
  - Displays current state of all machines and inventories.
  - Updates data in real-time as new messages are received.
  - Allows filtering and drilling down into specific machines or product lines.

- **Events/Side Effects:**
  - When new data is published to subscribed topics, the dashboard updates the relevant displays.
  - Alerts or notifications if certain thresholds are breached (e.g., low inventory).

### 2.2 Component Inputs/Outputs Mapped to Subscribe/Publish Topics

#### Component: Real-Time Data Visualization

- **Inputs:**
  - Subscribed Topics:
    - `v1/FY-Fab/sched/state/queue-snapshot`
    - `v1/FY-Fab/warehouse/state/inventory-S1`
    - `v1/FY-Fab/warehouse/state/inventory-S2`
    - `v1/FY-Fab/warehouse/state/inventory-S3`
    - `v1/FY-Fab/warehouse/state/inventory-S4`
    - `v1/FY-Fab/warehouse/state/inventory-S5`
    - `v1/FY-Fab/cold/CH01/state/current-job`
    - `v1/FY-Fab/cold/CH02/state/current-job`
    - `v1/FY-Fab/cold/TR01/state/current-job`
    - `v1/FY-Fab/cold/TR02/state/current-job`
  
- **Outputs:**
  - Published Topics:
    - N/A (this component primarily displays data)

#### Component: Inventory Status Display

- **Inputs:**
  - Subscribed Topics:
    - `v1/FY-Fab/warehouse/state/inventory-S1`
    - `v1/FY-Fab/warehouse/state/inventory-S2`
    - `v1/FY-Fab/warehouse/state/inventory-S3`
    - `v1/FY-Fab/warehouse/state/inventory-S4`
    - `v1/FY-Fab/warehouse/state/inventory-S5`

- **Outputs:**
  - Published Topics:
    - N/A (this component primarily displays data)

#### Component: Machine Status Overview

- **Inputs:**
  - Subscribed Topics:
    - `v1/FY-Fab/cold/CH01/state/current-job`
    - `v1/FY-Fab/cold/CH02/state/current-job`
    - `v1/FY-Fab/cold/TR01/state/current-job`
    - `v1/FY-Fab/cold/TR02/state/current-job`

- **Outputs:**
  - Published Topics:
    - N/A (this component primarily displays data)

#### Component: Production Jobs Tracking

- **Inputs:**
  - Subscribed Topics:
    - `v1/FY-Fab/sched/state/queue-snapshot`
  
- **Outputs:**
  - Published Topics:
    - `v1/FY-Fab/sched/action/push-to-queue`

---

## 3. Data & UNS Mapping

### 3.1 Subscribe/Publish Patterns

- **Subscribe Patterns:**
  - The dashboard subscribes to various topics related to inventory and machine status to receive real-time updates.

- **Publish Patterns:**
  - The dashboard may publish actions to push jobs into the production queue but mainly focuses on data display.

### 3.2 Parsing/Validation Rules

- JSON schema validation will be applied to ensure that incoming messages from subscribed topics conform to the expected structure.
  
### 3.3 Trigger Conditions

- The dashboard will trigger updates based on the incoming data from subscribed topics. For example, if inventory data changes (e.g., `onhand_kg` decreases), it will update the inventory display.

### 3.4 Exception/Alarm Strategies

- Alerts will be generated if inventory levels fall below a defined threshold (e.g., `onhand_kg < 1000`).
- Real-time machine status will be monitored for `error` states, triggering alerts to notify the management.

### 3.5 Reconnection/Fallback Strategies

- The system will implement a retry mechanism to reconnect to the MQTT broker in case of disconnection.
- If the dashboard fails to receive updates within a certain timeframe, it will display a "Data unavailable" message and attempt to re-establish the connection automatically.

---

## Conclusion

This specification outlines the requirements for a real-time dashboard for a metal factory, detailing its components, functionalities, and integration with the UNS/MQTT system. The dashboard aims to enhance operational efficiency by providing instant access to crucial data, enabling better decision-making and improved production management.