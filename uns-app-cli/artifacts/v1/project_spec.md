# Project Specification Document

## 1. Background

### User Story
As a factory manager of a metal factory, I want a dashboard that provides real-time data visualization of our production processes, so that I can monitor operations, manage resources efficiently, and make informed decisions.

### Business Scenario
The metal factory utilizes various machinery and processes to manufacture components, such as screws and panels. The current system lacks a centralized view of real-time production data, leading to inefficiencies and delayed response to operational issues. By implementing a dashboard that integrates with the Unified Namespace (UNS), the factory can visualize key metrics, track job statuses, and maintain an overview of inventory and workforce management.

## 2. Functional Requirements

### Dashboard Components

#### 2.1. Real-time Data Feed

- **Component**: Data Feed Module
- **Description**: Subscribes to various UNS topics to fetch real-time data.
- **Behaviors/States**:
  - Active: Continuously listens for updates and refreshes the dashboard.
  - Inactive: Stops receiving updates if the connection is lost.
- **Events/Side Effects**:
  - On data reception: Update the UI with new data.
  - On error: Display error message and retry connection.
  
- **Subscribe Topics**:
  - `v1/FY-Fab/erp/state/order-registry`
  - `v1/FY-Fab/plm/state/product-master-P-M5`
  - `v1/FY-Fab/plm/state/product-master-P-M6`
  - `v1/FY-Fab/plm/state/product-master-P-M8`
  - `v1/FY-Fab/plm/state/product-master-P-FL6`
  - `v1/FY-Fab/warehouse/state/inventory-S1`
  - `v1/FY-Fab/warehouse/state/inventory-S2`
  - `v1/FY-Fab/warehouse/state/inventory-S3`
  - `v1/FY-Fab/warehouse/state/inventory-S4`
  - `v1/FY-Fab/warehouse/state/inventory-S5`
  - `v1/FY-Fab/warehouse/state/inventory-W1`
  - `v1/FY-Fab/warehouse/state/inventory-W2`
  - `v1/FY-Fab/warehouse/state/inventory-W3`
  - `v1/FY-Fab/sched/state/queue-snapshot`
  
- **Publish Topics**: None

#### 2.2. Data Visualization

- **Component**: Visualization Module
- **Description**: Renders charts and graphs based on the data received from the Data Feed Module.
- **Behaviors/States**:
  - Render: Display data visually.
  - Update: Refresh visualizations on data changes.
- **Events/Side Effects**:
  - On new data: Redraw visual elements.
  
- **Subscribe Topics**: None (depends on Data Feed Module)
- **Publish Topics**: None

#### 2.3. Alert System

- **Component**: Alert Module
- **Description**: Monitors key metrics for thresholds and sends alerts.
- **Behaviors/States**:
  - Active: Continuously checks metrics.
  - Inactive: Stops monitoring if the connection is lost.
- **Events/Side Effects**:
  - On threshold breach: Trigger alert notification.
  
- **Subscribe Topics**:
  - `v1/FY-Fab/sched/state/plan-draft`
  - `v1/FY-Fab/sched/state/queue-snapshot`
  
- **Publish Topics**: None

### Input/Output Mapping to Topics

| Component         | Subscribe Topics                                           | Publish Topics | Inputs                   | Outputs                   |
|-------------------|----------------------------------------------------------|----------------|--------------------------|---------------------------|
| Data Feed Module   | `v1/FY-Fab/erp/state/order-registry`                     | None           | -                        | -                         |
|                   | `v1/FY-Fab/plm/state/product-master-P-M5`               |                | -                        | -                         |
|                   | `v1/FY-Fab/plm/state/product-master-P-M6`               |                | -                        | -                         |
|                   | `v1/FY-Fab/plm/state/product-master-P-M8`               |                | -                        | -                         |
|                   | `v1/FY-Fab/plm/state/product-master-P-FL6`              |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-S1`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-S2`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-S3`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-S4`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-S5`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-W1`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-W2`                |                | -                        | -                         |
|                   | `v1/FY-Fab/warehouse/state/inventory-W3`                |                | -                        | -                         |
|                   | `v1/FY-Fab/sched/state/queue-snapshot`                  |                | -                        | -                         |

## 3. Data & UNS Mapping

### Subscribe/Publish Patterns

- The dashboard will subscribe to the above-listed topics to fetch real-time data.
- The Data Feed Module will handle parsing incoming data and relaying it to the Visualization Module.

### Parsing/Validation Rules

- JSON schema validation will be performed upon receiving data to ensure it matches the expected structure.
- Invalid data will trigger an error state and notify the user.

### Trigger Conditions

- The Alert Module will trigger alerts based on the following conditions:
  - Queue length exceeds a predefined threshold.
  - Inventory levels fall below minimum requirements.

### Exception/Alarm Strategies

- If a subscription fails:
  - Log the error.
  - Retry connecting after a short delay.
- Alerts will be sent to the dashboard when thresholds are breached, displaying critical metrics prominently.

### Reconnection/Fallback Strategies

- Implement exponential backoff for reconnect attempts to manage network fluctuations.
- If persistent connection issues occur, display a user-friendly message indicating the loss of connection and potential actions.

## Conclusion

This project specification outlines the architecture and functional requirements for a dashboard tailored to a metal factory's needs, leveraging the Unified Namespace (UNS) to provide real-time data visualization and management tools. The implementation will enhance operational efficiency and decision-making capabilities for factory management.