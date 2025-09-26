# Project Specification Document: Industrial Dashboard for Metal Factory

## 1. Background

### User Story
As a factory manager at a metal manufacturing facility, I need a comprehensive dashboard that monitors all devices and provides real-time insights into production processes, inventory levels, and equipment statuses. This will enable me to make informed decisions, improve operational efficiency, and promptly address issues that may arise during production.

### Business Scenario
The factory produces various metal components, including screws, bolts, and panels. To maintain efficiency and quality, it is crucial to monitor real-time data from multiple sources, including machinery states, job statuses, and inventory levels. The dashboard will serve as a centralized platform that aggregates this information, enabling quick analysis and proactive management of production workflows.

## 2. Functional Requirements

### Pages/Modules

#### 2.1 Main Dashboard Module

**Components:**
- **Real-Time Data Display**
  - **Behaviors/States:** 
    - Displays current job statuses, inventory levels, and equipment states.
    - Updates every minute with new data from subscribed topics.
  - **Events/Side Effects:** 
    - Alert notifications for abnormal conditions (e.g., low inventory, machine faults).
  
**Inputs/Outputs Mapped to Subscribe/Publish Topics:**
- **Subscribe to:**
  - `v1/FY-Fab/sched/state/queue-snapshot`
  - `v1/FY-Fab/warehouse/state/inventory-S1`
  - `v1/FY-Fab/warehouse/state/inventory-S2`
  - `v1/FY-Fab/warehouse/state/inventory-S3`
  - `v1/FY-Fab/warehouse/state/inventory-S4`
  - `v1/FY-Fab/warehouse/state/inventory-S5`
  - `v1/FY-Fab/sheet/LASER01/state/current-job`
  - `v1/FY-Fab/sheet/BEND01/state/current-job`
  - `v1/FY-Fab/cold/CUT01/state/current-job`
  - `v1/FY-Fab/cold/TR01/state/current-job`
  
- **Publish to:** 
  - None (this module is only for monitoring)

#### 2.2 Inventory Management Module

**Components:**
- **Inventory Overview**
  - **Behaviors/States:**
    - Displays quantities of key materials (e.g., S1, S2, W1, etc.).
    - Highlights materials below a defined threshold.
  - **Events/Side Effects:**
    - Triggers a reorder request when inventory falls below minimum levels.

**Inputs/Outputs Mapped to Subscribe/Publish Topics:**
- **Subscribe to:**
  - `v1/FY-Fab/warehouse/state/inventory-S1`
  - `v1/FY-Fab/warehouse/state/inventory-S2`
  - `v1/FY-Fab/warehouse/state/inventory-S3`
  - `v1/FY-Fab/warehouse/state/inventory-S4`
  - `v1/FY-Fab/warehouse/state/inventory-S5`
  
- **Publish to:** 
  - `v1/FY-Fab/warehouse/state/inventory-reorder` (Hypothetical topic for reordering)

#### 2.3 Equipment Status Module

**Components:**
- **Machine Health Monitoring**
  - **Behaviors/States:**
    - Displays status of key machinery (LASER, BEND, CUT, TR, HT).
    - Real-time alerts for maintenance needs or failures.
  - **Events/Side Effects:**
    - Sends alerts to maintenance team for immediate action.

**Inputs/Outputs Mapped to Subscribe/Publish Topics:**
- **Subscribe to:**
  - `v1/FY-Fab/sheet/LASER01/state/current-job`
  - `v1/FY-Fab/sheet/BEND01/state/current-job`
  - `v1/FY-Fab/cold/CUT01/state/current-job`
  - `v1/FY-Fab/cold/TR01/state/current-job`
  
- **Publish to:** 
  - None (monitoring only)

## 3. Data & UNS Mapping

### 3.1 Subscribe/Publish Patterns
- **Real-Time Data Module:** Subscribes to various job states and inventory topics for real-time updates.
- **Inventory Management Module:** Subscribes to inventory snapshots to monitor stock levels.
- **Equipment Status Module:** Subscribes to equipment states to track machine health.

### 3.2 Parsing/Validation Rules
- All incoming data must be validated against the provided schema for each topic.
- If data is malformed or incomplete, log an error and trigger an alert.

### 3.3 Trigger Conditions
- Trigger alerts when:
  - Job statuses change to "failed" or "delayed".
  - Inventory levels drop below a specified threshold.
  - Machine status changes to "fault" or "maintenance required".

### 3.4 Exception/Alarm Strategies
- Implement a logging mechanism to capture errors and exceptions.
- Use a dedicated alerting system (e.g., email/SMS) to notify relevant personnel of critical issues.

### 3.5 Reconnection/Fallback Strategies
- Implement a fallback mechanism to re-establish MQTT connections if disconnected.
- Retry logic for subscribing to topics after a disconnection event, with exponential backoff.

---

This specification outlines the principles and functionalities of the dashboard tailored for a metal factory. The focus is on real-time monitoring and data visualization to enhance operational efficiency and decision-making.