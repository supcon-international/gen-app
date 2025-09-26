# UI Specification Document

## 1. Design Principles
- **User-friendly:** The interface should be straightforward and easy to navigate, reducing the cognitive load on users.
- **Intuitive:** Users should be able to understand how to interact with components without extensive training or documentation.
- **Balanced Data Presentation:** Information should be displayed in a balanced manner, combining visual and textual elements to enhance understanding without overwhelming the user.

---

## 2. Module: Dashboard

### 2.1 Information Architecture
- **Main Navigation:**
  - Dashboard (Home)
  - Inventory Status
  - Machine Status
  - Jobs Tracking

- **Dashboard Layout:**
  - Real-Time Data Visualization (Top Section)
  - Inventory Status Display (Middle Left Section)
  - Machine Status Overview (Middle Right Section)
  - Production Jobs Tracking (Bottom Section)

### 2.2 Component List
1. **Real-Time Data Visualization**
   - Chart for production efficiency (line/bar graph)
   - Gauge for overall factory performance

2. **Inventory Status Display**
   - Card display for each inventory section (S1 to S5)
   - Pie chart for overall inventory distribution

3. **Machine Status Overview**
   - Status indicators for each machine (CH01, CH02, TR01, TR02)
   - Table displaying current jobs for each machine

4. **Production Jobs Tracking**
   - Queue display for production jobs
   - Filter option to view specific job types

### 2.3 Interaction Flows
- **Viewing Real-Time Data:**
  - User opens the dashboard → All components load data from MQTT topics → Real-time updates occur as new data is pushed.

- **Filtering Inventory:**
  - User clicks on inventory card → Filters apply to show specific inventory details → Data updates accordingly.

- **Monitoring Machines:**
  - User clicks on a machine status indicator → Expands to show job details and history → User can drill down for more information.

### 2.4 Empty States
- **Real-Time Data Visualization:**
  - Message: "No data available." 
  - Action: Retry button to fetch data.

- **Inventory Status Display:**
  - Message: "No inventory data found." 
  - Action: Check connection or refresh.

- **Machine Status Overview:**
  - Message: "No active machines." 
  - Action: Encourage user to check connections.

- **Production Jobs Tracking:**
  - Message: "No jobs in queue." 
  - Action: Prompt user to add jobs.

### 2.5 Loading States
- **General Loading Animation:**
  - Spinner or progress bar displayed while fetching data.
  - Message: "Loading data, please wait..."

### 2.6 Error States
- **Data Fetch Error:**
  - Message: "Error fetching data. Please check your connection."
  - Action: Retry button.

- **Threshold Breached Alert:**
  - Notification: "Alert: Low inventory in [Section]."
  - Action: Direct link to inventory display.

### 2.7 Accessibility Considerations
- Ensure all interactive elements are keyboard navigable.
- Use ARIA roles and labels for screen readers.
- High color contrast for text and backgrounds.
- Provide text alternatives for charts and graphs.

---

## 3. Responsive Design Considerations
- **Mobile View:**
  - Stack components vertically.
  - Use collapsible sections for inventory and machine status.
  
- **Tablet View:**
  - Two-column layout for inventory and machine status.
  - Maintain data visualization as prominent features.

- **Desktop View:**
  - Three or four-column layout based on screen size.
  - Allow resizing of charts for better visibility.

---

## 4. Real-Time Data Presentation
- All components update in real-time based on MQTT subscription.
- Use WebSocket connections for efficient data transfer.
- Provide visual indicators for data freshness (e.g., timestamp of last update).

---

## 5. Conclusion
This UI specification outlines the design, components, and interactions for the dashboard of a metal factory management system. By focusing on real-time data visualization, user-friendly navigation, and accessibility, this dashboard aims to provide factory managers with the tools they need for effective operational management.