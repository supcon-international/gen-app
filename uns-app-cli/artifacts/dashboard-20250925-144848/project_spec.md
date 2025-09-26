# Project Specification Document

## 1. Background

### User Story
As a factory manager at a metal factory, I want to have a real-time dashboard that monitors all the devices and processes in the production line, so that I can track performance, identify issues promptly, and optimize operations.

### Business Scenario
The metal factory operates with multiple production stages, including cutting, cold forming, threading, and heat treatment. Each stage has its own set of machines and operators. By implementing a real-time dashboard, the factory can visualize data from various machines, orders, and inventories, allowing for better decision-making and increased productivity.

---

## 2. Functional Requirements

### Pages/Modules and their Components

#### Dashboard Module
- **Components:**
  - **Real-Time Overview Panel**
    - **Behavior/States:** Displays aggregated metrics such as the number of active jobs, queued jobs, and overall production efficiency.
    - **Events/Side Effects:** Refreshes data every minute.
    - **Subscribe Topics:**
      - `v1/FY-Fab/sched/state/queue-snapshot`
      - `v1/FY-Fab/cold/CH01/state/current-job`
      - `v1/FY-Fab/cold/CH02/state/current-job`
      - `v1/FY-Fab/sheet/LASER01/state/current-job`
      - `v1/FY-Fab/sheet/BEND01/state/current-job`
      - `v1/FY-Fab/sheet/ASSY01/state/current-job`
    - **Publish Topics:** None.

  - **Order Tracking Panel**
    - **Behavior/States:** Shows current open orders and their statuses.
    - **Events/Side Effects:** Updates when new orders are placed or existing orders are modified.
    - **Subscribe Topics:**
      - `v1/FY-Fab/erp/state/order-registry`
    - **Publish Topics:** None.

  - **Inventory Status Panel**
    - **Behavior/States:** Displays current inventory levels for materials.
    - **Events/Side Effects:** Alerts when inventory falls below a threshold.
    - **Subscribe Topics:**
      - `v1/FY-Fab/warehouse/state/inventory-S1`
      - `v1/FY-Fab/warehouse/state/inventory-S2`
      - `v1/FY-Fab/warehouse/state/inventory-S3`
      - `v1/FY-Fab/warehouse/state/inventory-S4`
      - `v1/FY-Fab/warehouse/state/inventory-S5`
      - `v1/FY-Fab/warehouse/state/inventory-W1`
      - `v1/FY-Fab/warehouse/state/inventory-W2`
      - `v1/FY-Fab/warehouse/state/inventory-W3`
    - **Publish Topics:** None.

  - **Machine Performance Panel**
    - **Behavior/States:** Monitors the operational status and performance metrics of each machine.
    - **Events/Side Effects:** Triggers notifications for alerts or downtime.
    - **Subscribe Topics:**
      - `v1/FY-Fab/cold/CH01/state/current-job`
      - `v1/FY-Fab/cold/CH02/state/current-job`
      - `v1/FY-Fab/sheet/LASER01/state/current-job`
      - `v1/FY-Fab/sheet/BEND01/state/current-job`
    - **Publish Topics:** None.

#### Alerts and Notifications Module
- **Components:**
  - **Alerts Engine**
    - **Behavior/States:** Processes alerts based on predefined conditions (e.g., low inventory, machine downtime).
    - **Events/Side Effects:** Sends notifications via email or SMS.
    - **Subscribe Topics:** Various topic subscriptions depending on alert criteria (e.g., inventory levels, machine status).
    - **Publish Topics:** Alerts to notification channels.

---

## 3. Data & UNS Mapping

### Subscribe/Publish Patterns

| Component                | Subscribe Topics                                                                                   | Publish Topics                  |
|--------------------------|---------------------------------------------------------------------------------------------------|----------------------------------|
| Real-Time Overview Panel  | `v1/FY-Fab/sched/state/queue-snapshot`<br>`v1/FY-Fab/cold/CH01/state/current-job`<br>`v1/FY-Fab/cold/CH02/state/current-job`<br>`v1/FY-Fab/sheet/LASER01/state/current-job`<br>`v1/FY-Fab/sheet/BEND01/state/current-job`<br>`v1/FY-Fab/sheet/ASSY01/state/current-job` | None                             |
| Order Tracking Panel      | `v1/FY-Fab/erp/state/order-registry`                                                           | None                             |
| Inventory Status Panel    | `v1/FY-Fab/warehouse/state/inventory-S1`<br>`v1/FY-Fab/warehouse/state/inventory-S2`<br>`v1/FY-Fab/warehouse/state/inventory-S3`<br>`v1/FY-Fab/warehouse/state/inventory-S4`<br>`v1/FY-Fab/warehouse/state/inventory-S5`<br>`v1/FY-Fab/warehouse/state/inventory-W1`<br>`v1/FY-Fab/warehouse/state/inventory-W2`<br>`v1/FY-Fab/warehouse/state/inventory-W3` | None                             |
| Machine Performance Panel  | `v1/FY-Fab/cold/CH01/state/current-job`<br>`v1/FY-Fab/cold/CH02/state/current-job`<br>`v1/FY-Fab/sheet/LASER01/state/current-job`<br>`v1/FY-Fab/sheet/BEND01/state/current-job`  | None                             |
| Alerts Engine             | Varies based on alert criteria                                                                   | Alerts to notification channels  |

### Parsing/Validation Rules
- Ensure all incoming data is validated against the defined JSON schemas for each topic.
- Handle unexpected data formats by logging errors and notifying the system administrator.

### Trigger Conditions
- Trigger alerts when:
  - Inventory on hand falls below a defined threshold.
  - Machine status changes to 'idle' or 'downtime'.
  - Order due dates are approaching.

### Exception/Alarm Strategies
- Log errors in a central logging system.
- Send notifications to system administrators for critical failures.
- Implement retries for transient failures on data subscriptions.

### Reconnection/Fallback Strategies
- Implement automatic reconnection for MQTT subscriptions with exponential backoff.
- Maintain an internal state so that if a connection is lost, the dashboard can display the last known good state until the connection is reestablished.

---

This specification document outlines the requirements and structure for implementing a real-time dashboard in a metal factory using UNS and MQTT systems. The detailed mapping of components, topics, and behaviors ensures clarity and traceability throughout the project lifecycle.