# UI Specification Document for Real-Time Dashboard in Metal Factory

## 1. Design Principles
- **User-friendly:** The UI should be straightforward, allowing users to navigate with minimal effort.
- **Intuitive:** Users should be able to understand functionalities without extensive training.
- **Balanced Data Presentation:** Data should be displayed in a way that emphasizes key metrics while avoiding information overload.

---

## 2. Modules Specification

### Dashboard Module

#### Information Architecture
- **Dashboard Module**
  - Real-Time Overview Panel
  - Order Tracking Panel
  - Inventory Status Panel
  - Machine Performance Panel

#### Component List
1. **Real-Time Overview Panel**
   - Aggregated Metrics Display
   - Refresh Button (optional)
   
2. **Order Tracking Panel**
   - Order List
   - Order Status Indicators

3. **Inventory Status Panel**
   - Inventory Levels Gauge
   - Low Inventory Alerts

4. **Machine Performance Panel**
   - Machine Status Indicators (Active, Idle, Down)
   - Performance Metrics Charts

#### Interaction Flows
- **Real-Time Overview Panel:**
  - Users can view metrics at a glance.
  - Data refreshes automatically every minute.
  
- **Order Tracking Panel:**
  - Users can click on an order to view detailed information.
  - Updates dynamically as orders change.

- **Inventory Status Panel:**
  - Users are alerted visually when inventory levels drop.
  - Clickable gauge for more details.

- **Machine Performance Panel:**
  - Users can monitor machine health and performance.
  - Clicking on a machine will provide detailed metrics.

#### Empty States
- **Real-Time Overview Panel:**
  - "No active jobs at the moment."
  
- **Order Tracking Panel:**
  - "No open orders."
  
- **Inventory Status Panel:**
  - "Inventory is currently at optimal levels."

- **Machine Performance Panel:**
  - "All machines are operational."

#### Loading States
- Use a spinner next to each panel while data is being fetched.
- Grey out components and display "Loading..." text.

#### Error States
- **Real-Time Overview Panel:**
  - "Error loading data. Please try refreshing."

- **Order Tracking Panel:**
  - "Failed to load orders. Check connection."

- **Inventory Status Panel:**
  - "Unable to retrieve inventory data."

- **Machine Performance Panel:**
  - "Machine data is currently unavailable."

#### Accessibility Considerations
- Ensure all components have ARIA labels for screen readers.
- Use high-contrast colors for readability.
- Provide text alternatives for charts and graphs.
- Allow keyboard navigation for all interactive elements.

---

### Alerts and Notifications Module

#### Information Architecture
- **Alerts and Notifications Module**
  - Alerts Engine

#### Component List
1. **Alerts Engine**
   - Alert List
   - Notification Settings

#### Interaction Flows
- Users can configure alert criteria from the notification settings.
- Alerts are displayed in real-time as they are triggered.

#### Empty States
- "No alerts at this time."

#### Loading States
- "Loading alerts..." displayed while fetching data.

#### Error States
- "Unable to load alerts. Please check your connection."

#### Accessibility Considerations
- Provide clear and concise messages for each alert.
- Use distinct colors and icons to indicate the severity of alerts.
- Ensure all alerts are keyboard accessible.

---

## 3. Data Visualization

### Prioritized Components
- **Charts and Graphs:**
  - Real-Time Overview Panel should use line charts for trends.
  - Machine Performance Panel should use performance gauges for each machine.
  - Inventory Status Panel should visualize inventory levels with bar graphs.

### Responsive Design Considerations
- **Mobile-First Approach:**
  - Stack panels vertically on small screens.
  - Use collapsible menus for navigation.
  
- **Breakpoints:**
  - Desktop: 1200px and above
  - Tablet: 768px to 1199px
  - Mobile: Below 768px

- **Flexibility:**
  - Components should adjust size and layout based on available screen real estate.

### Real-Time Data Presentation
- Implement WebSocket or MQTT for real-time data pushing.
- Ensure visual components update dynamically without page refreshes.
- Display a timestamp for the last data update.

---

This UI specification document serves as a comprehensive guide for implementing the real-time dashboard for the metal factory, ensuring alignment with the project specifications and facilitating effective user interaction with real-time data.