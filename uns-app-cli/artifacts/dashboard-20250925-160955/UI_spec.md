```markdown
# UI Specification Document for Industrial Dashboard

## 1. Design Principles
- **User-friendly**: The interface should be easy to navigate, with clear labeling and logical grouping of information.
- **Intuitive**: Users should be able to understand and interact with the dashboard without extensive training.
- **Balanced Data Presentation**: Data should be presented in a way that highlights critical information while allowing for exploration of details.

## 2. Modules Specification

### 2.1 Dashboard Module

#### Information Architecture
- **Components**: 
  - Real-time Data Display
  - Data Visualization

#### Component List
1. **Real-time Data Display**
   - Current Production Status
   - Inventory Levels
   - Workforce Availability
2. **Data Visualization**
   - Graphs for Production Metrics
   - Charts for Downtime
   - Historical Data Comparisons

#### Interaction Flows
- User navigates to the dashboard.
- Real-time data updates dynamically refresh the display.
- User selects a date range to view historical data, triggering a fetch for the relevant information.

#### Empty States
- "No Data Available" message with an option to refresh or check connections.

#### Loading States
- Spinner or loading animation displayed while fetching real-time data or historical data.

#### Error States
- "Error fetching data" message with a retry button.

#### Accessibility Considerations
- Use ARIA roles for dynamic updates.
- Provide keyboard navigation options.
- Ensure color contrast meets WCAG AA standards.

---

### 2.2 Inventory Module

#### Information Architecture
- **Components**: 
  - Inventory Overview

#### Component List
1. **Inventory Overview**
   - Material Levels (S1 to S5, W1 to W3)
   - Allocated vs. On-Hand Quantities

#### Interaction Flows
- User views inventory overview on the dashboard.
- Data updates in real-time as new inventory data is published.

#### Empty States
- "No inventory data available" message with a suggestion to check inventory systems.

#### Loading States
- Progress indicator while loading inventory data.

#### Error States
- "Unable to load inventory data" message with a refresh option.

#### Accessibility Considerations
- Ensure tables are navigable with screen readers.
- Use semantic HTML for displaying inventory data.

---

### 2.3 Production Status Module

#### Information Architecture
- **Components**: 
  - Job Queue Overview

#### Component List
1. **Job Queue Overview**
   - Job Status Display (CUTWIRE, COLD, THREAD, etc.)
   - Indicators for Queued, Running, Completed Jobs

#### Interaction Flows
- User accesses the job queue status from the dashboard.
- UI updates automatically when job statuses change.

#### Empty States
- "No jobs currently in the queue" message.

#### Loading States
- Loading spinner while fetching job queue data.

#### Error States
- "Job queue status could not be retrieved" message with a retry button.

#### Accessibility Considerations
- Provide tooltips for job statuses.
- Ensure job indicators are distinguishable for color-blind users.

---

### 2.4 Workforce Module

#### Information Architecture
- **Components**: 
  - Workforce Availability

#### Component List
1. **Workforce Availability**
   - Headcount Display per Shift
   - Operator Group Listings (OP_CUT, OP_COLD, etc.)

#### Interaction Flows
- User views workforce availability from the dashboard.
- Data refreshes automatically based on workforce state changes.

#### Empty States
- "No workforce data available" message.

#### Loading States
- Spinner displayed while loading workforce data.

#### Error States
- "Error loading workforce availability" message with a retry option.

#### Accessibility Considerations
- Headcount numbers should be large and legible.
- Use accessible terminology for operator groups.

---

## 3. Responsive Design Considerations
- **Mobile**: Ensure that all modules stack vertically with collapsible sections for better usability on smaller screens.
- **Tablet**: Allow for side-by-side components with adjustable widths.
- **Desktop**: Enable multi-column layouts for enhanced visibility of data and visualizations.

## 4. Real-time Data Presentation
- Use WebSockets or MQTT for real-time data streaming to ensure that users receive the latest updates without needing to refresh the page manually.
- Implement throttling on UI updates to prevent performance issues during high-frequency data updates.

## 5. Conclusion
This UI specification document outlines the design, components, and interactions necessary to create an effective industrial dashboard for real-time monitoring of production processes in a metal factory. The focus on data visualization, accessibility, and responsive design ensures that the dashboard is both functional and user-friendly.
```
