# Production Monitoring Dashboard - Product Requirements Document

## 1. Background

### User Story
As a manufacturing floor manager, I need a real-time production monitoring dashboard to track equipment status, production metrics, and manage alerts across the factory floor, enabling quick decision-making and proactive issue resolution.

### Industry Context
The FY-Fab manufacturing facility operates multiple production lines including:
- Sheet metal processing (laser cutting, bending, coating, assembly)
- Cold forming operations (wire cutting, cold heading, threading, heat treatment)
- Multi-stage production workflows with interdependencies
- Tooling and mold management requirements
- Workforce scheduling across multiple shifts

## 2. Functional Requirements

### 2.1 Core Dashboard Components

#### KPI Cards Component
- **Purpose**: Display critical production metrics at a glance
- **Data Points**:
  - Active Jobs Count (derived from station state topics)
  - Overall Equipment Efficiency (OEE)
  - Production Rate (units/hour)
  - Quality Rate (good parts percentage)
- **Interactions**: Auto-refresh every 5 seconds
- **Subscribe Topics**:
  - `v1/FY-Fab/+/+/state/current-job` (QoS 0)
  - `v1/FY-Fab/+/+/metrics/+` (QoS 0)

#### Equipment Status Grid Component
- **Purpose**: Real-time visualization of all equipment status
- **Layout**: Grid of equipment cards grouped by production area
- **Equipment Categories**:
  - Sheet Processing: LASER01, BEND01, COAT01, ASSY01, ASSY02
  - Cold Forming: CUT01, CH01, CH02, TR01, TR02, HT01
- **Status States**: idle, running, queued, maintenance, error
- **Data Fields per Equipment**:
  - Station ID
  - Current Status
  - Current Job ID
  - Batch Quantity
  - Operator Group
- **Subscribe Topics**:
  - `v1/FY-Fab/sheet/+/state/current-job` (QoS 0)
  - `v1/FY-Fab/cold/+/state/current-job` (QoS 0)
  - `v1/FY-Fab/cold/+/state/batch-status` (QoS 0)

#### Active Alerts Panel Component
- **Purpose**: Display and manage production alerts
- **Alert Types**:
  - Changeover Required
  - Quality Issues
  - Equipment Maintenance
  - Material Shortage
- **Data Fields**:
  - Alert Timestamp
  - Severity (critical, warning, info)
  - Equipment/Station
  - Description
  - Acknowledgment Status
- **Subscribe Topics**:
  - `v1/FY-Fab/cold/+/state/current-mold` (QoS 0) - monitor mold life
  - `v1/FY-Fab/sheet/+/state/clean-status` (QoS 0)
  - `v1/FY-Fab/sched/state/queue-snapshot` (QoS 0)

#### Production Schedule View Component
- **Purpose**: Display current and upcoming production jobs
- **Data Fields**:
  - Job ID
  - Order ID
  - Product ID
  - Target Station
  - Scheduled Start/End Times
  - Batch Quantity
  - Changeover Requirements
- **Subscribe Topics**:
  - `v1/FY-Fab/sched/state/plan-draft` (QoS 0)
  - `v1/FY-Fab/erp/state/order-registry` (QoS 0)

#### Material & Tooling Status Component
- **Purpose**: Track material inventory and tooling status
- **Sections**:
  - Material Inventory (sheets and wires)
  - Mold Status and Life Tracking
  - Changeover Matrix Display
- **Subscribe Topics**:
  - `v1/FY-Fab/warehouse/state/inventory-+` (QoS 0)
  - `v1/FY-Fab/tooling/state/mold-+` (QoS 0)
  - `v1/FY-Fab/tooling/state/changeover-matrix-+` (QoS 0)

#### Control Actions Panel Component
- **Purpose**: Send production control commands
- **Actions Available**:
  - Dispatch Job to Station
  - Start/Complete Task
  - Initiate Mold Change
  - Push Job to Queue
- **Publish Topics**:
  - `v1/FY-Fab/sched/action/push-to-queue` (QoS 1)
  - `v1/FY-Fab/cold/+/action/dispatch-task` (QoS 1)
  - `v1/FY-Fab/cold/+/action/start-task` (QoS 1)
  - `v1/FY-Fab/cold/+/action/change-mold` (QoS 1)

### 2.2 Real-time Message Feed Component
- **Purpose**: Display recent MQTT messages for monitoring
- **Features**:
  - Last 50 messages with timestamps
  - Topic filtering capability
  - Payload preview with expand option
- **Layout**: Scrollable list in side panel

## 3. Data & UNS Mapping

### 3.1 Subscription Topics Summary

| Topic Pattern | QoS | Update Frequency | Data Fields |
|--------------|-----|------------------|-------------|
| `v1/FY-Fab/erp/state/order-registry` | 0 | ~33 msg/s | op, order_id, product_id, qty, due_date, priority |
| `v1/FY-Fab/plm/state/product-master-+` | 0 | ~200 msg/s | product_id, name, route steps, batch times |
| `v1/FY-Fab/cold/+/state/current-job` | 0 | 0.5-1 msg/s | job_id, status, batch_qty |
| `v1/FY-Fab/cold/+/state/current-mold` | 0 | ~50 msg/s | mold_id, since_ts, life_used_cycles |
| `v1/FY-Fab/sheet/+/state/current-job` | 0 | 0.5-1 msg/s | job_id, status, batch_qty |
| `v1/FY-Fab/warehouse/state/inventory-+` | 0 | ~50 msg/s | material_id, onhand_kg, allocated_kg |
| `v1/FY-Fab/sched/state/plan-draft` | 0 | 0.2 msg/s | plan_id, job_id, target_station, est_start_ts |
| `v1/FY-Fab/sched/state/queue-snapshot` | 0 | 0.1 msg/s | queued_jobs, running_jobs |
| `v1/FY-Fab/cold/+/metrics/+` | 0 | 2-2.5 msg/s | count or cycle_ms values |

### 3.2 Publish Topics Summary

| Topic Pattern | QoS | Payload Fields | Trigger |
|--------------|-----|----------------|---------|
| `v1/FY-Fab/sched/action/push-to-queue` | 1 | plan_id, job_id, target_station, dispatch_mode | User button click |
| `v1/FY-Fab/cold/+/action/dispatch-task` | 1 | job_id, order_id, product_id, batch_qty | User dispatch action |
| `v1/FY-Fab/cold/+/action/start-task` | 1 | job_id, operator_group, expect_minutes | User start action |
| `v1/FY-Fab/cold/+/action/complete-task` | 1 | job_id, good_qty, end_reason | User complete action |
| `v1/FY-Fab/cold/+/action/change-mold` | 1 | to_mold, reason, est_setup_min | User changeover action |

## 4. Non-Functional Requirements

- **Real-time Updates**: All metrics refresh within 5 seconds of MQTT message receipt
- **Connection Resilience**: Auto-reconnect on MQTT disconnection with exponential backoff
- **Data Accuracy**: No mock data; display "No data available" when topics have no messages
- **Performance**: Handle up to 100 messages/second without UI lag
- **Responsive Layout**: Optimize for 1440×900 and 1920×1080 displays
- **Accessibility**: High contrast mode for factory floor visibility

## 5. Data Collection Notes

During the 45-second collection window on the HiveMQ public broker, no active topics matching the FY-Fab namespace were detected. The application will subscribe to all specified topics and display real-time data as it becomes available during runtime. Empty states will show "No data available" messaging.

## 6. Technical Constraints

- Single-page application (no routing)
- MQTT v4 browser client via WebSocket
- Tailwind CSS v3.4.x (no custom colors)
- shadcn/ui components only
- No mock or randomized data generation