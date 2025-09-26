# UI Specification Document: Industrial Dashboard for Metal Factory

## 1. Design Principles
- **User-Friendly:** The interface is designed with simplicity in mind, allowing easy navigation and quick access to crucial information.
- **Intuitive:** Components are logically grouped, and familiar icons/terms are used to facilitate user understanding.
- **Balanced Data Presentation:** Information is presented in a visually appealing manner, ensuring that users can absorb data quickly without being overwhelmed.

---

## 2. Module Specifications

### 2.1 Main Dashboard Module

#### Information Architecture
- **Header:** 
  - Title, Date/Time, User Profile
- **Sidebar:** 
  - Navigation links to Inventory Management and Equipment Status
- **Main Content Area:** 
  - Real-Time Data Display

#### Component List
- **Header Component**
- **Sidebar Navigation Component**
- **Real-Time Job Status Chart**
- **Real-Time Inventory Levels Chart**
- **Equipment Status Gauge**
- **Alert Notification Banner**

#### Interaction Flows
1. **User logs in** → Header & Sidebar load.
2. **Real-Time Data Display** updates every minute.
3. **User clicks on alert notification** → Modal with details appears.

#### Empty States
- **No Data Available:** Display a message "No real-time data available. Please check your connections."
  
#### Loading States
- **Loading Spinner** displayed while fetching real-time data.
  
#### Error States
- **Error Notification:** "Error fetching data. Please check your connection or try again later."
  
#### Accessibility Considerations
- Ensure all elements have appropriate ARIA labels.
- Use high-contrast colors for readability.
- Provide keyboard navigation and focus management.

---

### 2.2 Inventory Management Module

#### Information Architecture
- **Header:** 
  - Title, Date/Time, User Profile
- **Sidebar:** 
  - Navigation links to Main Dashboard and Equipment Status
- **Main Content Area:** 
  - Inventory Overview

#### Component List
- **Header Component**
- **Sidebar Navigation Component**
- **Inventory Overview List**
- **Threshold Alert Indicator**
- **Reorder Request Button**

#### Interaction Flows
1. **User selects Inventory Management from Sidebar** → Inventory Overview loads.
2. **Inventory items below threshold** are highlighted, prompting reorder.
3. **User clicks Reorder Request Button** → Confirmation Modal appears.

#### Empty States
- **No Inventory Data:** "No inventory data available. Please check your connections."

#### Loading States
- **Loading Spinner** displayed while fetching inventory data.

#### Error States
- **Error Notification:** "Unable to retrieve inventory levels. Please retry."

#### Accessibility Considerations
- Inventory items should be navigable via keyboard.
- Use screen reader-friendly labels for inventory items and actions.

---

### 2.3 Equipment Status Module

#### Information Architecture
- **Header:** 
  - Title, Date/Time, User Profile
- **Sidebar:** 
  - Navigation links to Main Dashboard and Inventory Management
- **Main Content Area:** 
  - Machine Health Monitoring

#### Component List
- **Header Component**
- **Sidebar Navigation Component**
- **Machine Status Indicators (Gauges)**
- **Real-Time Alerts List**
- **Maintenance Request Button**

#### Interaction Flows
1. **User selects Equipment Status from Sidebar** → Machine Health Monitoring loads.
2. **Machine Status Gauges update** based on real-time data.
3. **User clicks on a specific machine gauge** → Detailed status modal appears.
4. **User clicks Maintenance Request Button** → Confirmation Modal appears.

#### Empty States
- **No Machine Data:** "No machine status data available. Please check your connections."

#### Loading States
- **Loading Spinner** displayed while fetching machine status data.

#### Error States
- **Error Notification:** "Error fetching machine health data. Please retry."

#### Accessibility Considerations
- Ensure gauges have accessible descriptions for screen readers.
- Use color-blind friendly color palettes for status indicators.

---

## 3. Data & UNS Mapping

### 3.1 Subscribe/Publish Patterns
- **Real-Time Data Module:** Subscribes to various job states and inventory topics for real-time updates.
- **Inventory Management Module:** Subscribes to inventory snapshots to monitor stock levels.
- **Equipment Status Module:** Subscribes to equipment states to track machine health.

### 3.2 Parsing/Validation Rules
- All incoming data must be validated against the provided schema for each topic.
- In case of malformed or incomplete data, log an error and trigger an alert.

### 3.3 Trigger Conditions
- **Job Status Change:** Trigger alerts for "failed" or "delayed" statuses.
- **Inventory Level Drop:** Trigger alerts for levels below a specified threshold.
- **Machine Status Change:** Trigger alerts for "fault" or "maintenance required" statuses.

### 3.4 Exception/Alarm Strategies
- Implement logging to capture errors and exceptions.
- Use a dedicated alerting system to notify relevant personnel of critical issues.

### 3.5 Reconnection/Fallback Strategies
- Implement a fallback mechanism to re-establish MQTT connections if disconnected.
- Retry logic for subscribing to topics after disconnection with exponential backoff.

---

## 4. Responsive Design Considerations
- Ensure all components are fluid and adapt to different screen sizes.
- Use a mobile-first approach, prioritizing essential data presentation for smaller devices.
- Test interactions and data visualizations to ensure usability across various platforms (tablets, desktops).

---

This UI specification document outlines the detailed design and interaction strategies for the Industrial Dashboard tailored specifically for a metal manufacturing facility, focusing on real-time data presentation and effective user engagement.