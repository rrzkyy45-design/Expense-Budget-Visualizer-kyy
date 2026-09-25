# Requirements Document

## Introduction

PocketPulse is a client-side personal finance dashboard built with HTML, CSS, and vanilla JavaScript. It enables users to record and categorise daily expenses, visualise spending distribution through an interactive chart, track progress against a self-defined monthly spending limit, and persist all data locally in the browser. The application requires no backend, no build toolchain, and no JavaScript framework.

---

## Glossary

- **Dashboard**: The single-page application interface rendered by `index.html`.
- **Transaction**: A single expense record consisting of a description, a monetary amount, a category, and an optional date.
- **Transaction_Manager**: The JavaScript module responsible for adding, storing, and deleting transactions.
- **Category**: One of four predefined expense classifications — Food, Transport, Fun, or Other.
- **Summary_Card**: A UI element that displays an aggregated monetary total for either all transactions or a single category.
- **Chart**: The doughnut chart rendered by Chart.js that shows the proportional spending breakdown across all categories.
- **Spending_Limit**: A user-defined monthly budget ceiling against which total spending is compared.
- **Progress_Bar**: The horizontal fill indicator that communicates how much of the Spending_Limit has been consumed.
- **Transaction_List**: The rendered list of Transaction items with per-item delete controls.
- **Category_Filter**: The dropdown control that restricts the Transaction_List to a chosen Category.
- **Theme_Toggle**: The button that switches the Dashboard between light mode and dark mode.
- **LocalStorage**: The browser's `localStorage` API used to persist all application state across page reloads.
- **Validator**: The client-side form validation logic that enforces input correctness before a Transaction is accepted.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a student, I want to record a new expense with a description, amount, category, and date, so that I can track where my money is going.

#### Acceptance Criteria

1. THE Dashboard SHALL present a form containing a text input for description (max 200 characters), a numeric input for amount, a category selector, and a date picker.
2. WHEN the form is submitted with a non-empty description (1–200 characters) and a numeric amount between 0.01 and 999,999,999.99, THE Transaction_Manager SHALL create a new Transaction and append it to the transaction collection.
3. IF the description field is empty at submission time, THEN THE Validator SHALL display the error message "Please enter a description." adjacent to the description field and prevent the Transaction from being created.
4. IF the amount field is empty, non-numeric, less than or equal to zero, or greater than 999,999,999.99 at submission time, THEN THE Validator SHALL display the error message "Please enter a valid amount greater than 0." adjacent to the amount field and prevent the Transaction from being created.
5. WHEN a Transaction is successfully added, THE Dashboard SHALL reset the form fields and set the date picker to the current date.
6. WHEN a Transaction is successfully added, THE Dashboard SHALL move focus to the description field.
7. THE Transaction_Manager SHALL round each Transaction amount to two decimal places at the time of creation.
8. IF the user does not select a date, THEN THE Dashboard SHALL store the Transaction with an empty date value and omit the date from the Transaction_List display.
9. IF the category selector has no option selected at submission time, THEN THE Validator SHALL prevent the Transaction from being created and display an error adjacent to the category selector.

---

### Requirement 2: Transaction Categories

**User Story:** As a student, I want to assign each expense to a category, so that I can see which area of my life is costing the most.

#### Acceptance Criteria

1. THE Dashboard SHALL offer exactly four category options in the transaction form: Food, Transport, Fun, and Other.
2. THE Dashboard SHALL display a dedicated Summary_Card for each of the four categories — Food, Transport, Fun, and Other — each showing the summed amount for that category.
3. WHEN a Transaction is added or deleted, THE Dashboard SHALL recalculate and update every Summary_Card within 100 milliseconds.
4. THE Dashboard SHALL render each category with a distinct, visually distinguishable accent colour consistently applied across category badges, Summary_Cards, and Chart segments.
5. THE Dashboard SHALL display the category icon and colour-coded badge on each Transaction_List item.

---

### Requirement 3: Total Spending Summary

**User Story:** As a student, I want to see my total spending at a glance, so that I immediately understand my overall financial position.

#### Acceptance Criteria

1. THE Dashboard SHALL display a hero Summary_Card showing the sum of all Transaction amounts formatted as a USD currency string to two decimal places, where zero transactions results in a displayed total of "$0.00".
2. THE Dashboard SHALL display the total count of Transactions below the total spending amount, using singular form ("1 transaction") for exactly one Transaction and plural form ("N transactions") for zero or more than one Transaction.
3. WHEN a Transaction is added or deleted, THE Dashboard SHALL update the hero Summary_Card total and transaction count within 500 milliseconds without requiring a page reload.
4. IF a Transaction amount is negative, THEN THE Dashboard SHALL include it in the sum as a negative value and reflect it in the displayed total.

---

### Requirement 4: Transaction List Display

**User Story:** As a student, I want to view all my recorded expenses in a list, so that I can review and manage individual transactions.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction showing its category icon, description, category badge, amount, and a delete button.
2. IF a Transaction has a date value, THEN THE Transaction_List SHALL display the date for that Transaction item.
3. WHEN Transactions are rendered, THE Dashboard SHALL present them in reverse-chronological order (most recently added first).
4. WHEN the transaction collection is empty or no Transactions match the active Category_Filter, THE Dashboard SHALL display an empty-state message reading "No transactions yet" in place of the Transaction_List.
5. IF a Transaction description overflows its container, THEN THE Dashboard SHALL truncate it with an ellipsis and preserve the full text in a tooltip.
6. THE Dashboard SHALL escape HTML special characters in Transaction descriptions before rendering to prevent cross-site scripting.

---

### Requirement 5: Delete a Transaction

**User Story:** As a student, I want to remove an incorrect or duplicate expense, so that my records stay accurate.

#### Acceptance Criteria

1. WHEN the user activates the delete button on a Transaction_List item, THE Transaction_Manager SHALL display a confirmation prompt before proceeding with the deletion.
2. WHEN the user confirms the deletion, THE Transaction_Manager SHALL remove that Transaction from the collection within 500 milliseconds.
3. WHEN a Transaction is deleted, THE Dashboard SHALL update the Summary_Cards, Chart, Spending_Limit progress, and Transaction_List to reflect the post-deletion state without requiring a page reload.
4. IF the page is reloaded after a Transaction is deleted, THEN THE Transaction_Manager SHALL not restore the deleted Transaction to the collection.

---

### Requirement 6: Clear All Transactions

**User Story:** As a student, I want to reset all my expense data in one action, so that I can start a new tracking period cleanly.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a "Clear All" button in the Transaction_List header.
2. IF the transaction collection is non-empty, WHEN the "Clear All" button is activated, THE Dashboard SHALL present a browser confirmation dialog before proceeding.
3. WHEN the user confirms the dialog, THE Transaction_Manager SHALL remove all Transactions from the collection, and THE Dashboard SHALL display an empty Transaction_List, a zeroed Budget summary, and a cleared visualization chart.
4. WHEN the user dismisses the dialog, THE Transaction_Manager SHALL leave the transaction collection unchanged.
5. IF the transaction collection is empty, WHEN the "Clear All" button is activated, THE Dashboard SHALL disable the "Clear All" button such that it cannot be activated.

---

### Requirement 7: Spending Distribution Chart

**User Story:** As a student, I want to see a visual breakdown of my spending by category, so that I can identify where most of my money goes at a glance.

#### Acceptance Criteria

1. THE Chart SHALL render as a doughnut chart using Chart.js, displaying one segment per category that has a total spending amount greater than zero, proportional to that category's share of total spending.
2. WHEN the total spending across all Transactions is greater than zero, THE Dashboard SHALL display the Chart and hide the empty-state placeholder.
3. WHEN the total spending is zero, THE Dashboard SHALL hide the Chart canvas and display the empty-state placeholder.
4. WHEN a Transaction is added or deleted, THE Chart data update transition SHALL complete within 500 milliseconds.
5. WHEN the user hovers over a Chart segment, THE Chart SHALL display a tooltip showing the amount formatted as "$X.XX" and the category label for that segment.
6. THE Chart SHALL use the same accent colours as the category cards consistently across all segments.

---

### Requirement 8: Monthly Spending Limit

**User Story:** As a student, I want to set a monthly budget ceiling, so that I receive a visual warning before I overspend.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a numeric input accepting values between 0.01 and 999,999,999.99 and a "Set Limit" button for defining the Spending_Limit.
2. WHEN the user activates the "Set Limit" button with a valid numeric value greater than zero, THE Dashboard SHALL store that value as the active Spending_Limit and update the Progress_Bar within 100 milliseconds.
3. IF the spending limit input is empty, non-numeric, less than 0.01, or greater than 999,999,999.99 when "Set Limit" is activated, THEN THE Dashboard SHALL apply a visual error style to the input and return focus to it without updating the Spending_Limit.
4. WHEN the user presses the Enter key while the limit input is focused, THE Dashboard SHALL treat the action as equivalent to activating the "Set Limit" button, applying the same validation and storage rules from criteria 2 and 3.
5. WHILE a Spending_Limit is set and total spending is below 80% of the Spending_Limit, THE Progress_Bar SHALL render with the primary indigo gradient and display the remaining budget as "✅ $X.XX remaining", where X.XX is rounded to two decimal places.
6. WHILE a Spending_Limit is set and total spending is greater than or equal to 80% and strictly less than 100% of the Spending_Limit, THE Progress_Bar SHALL render with an orange warning gradient and display "⚡ Approaching limit — $X.XX remaining", where X.XX is rounded to two decimal places.
7. WHILE a Spending_Limit is set and total spending equals or exceeds 100% of the Spending_Limit, THE Progress_Bar SHALL render with a red danger gradient and display "⚠️ Over limit by $X.XX!", where X.XX is the absolute overage amount rounded to two decimal places.
8. WHILE no Spending_Limit is set, THE Dashboard SHALL display "Limit: —" and render the Progress_Bar at zero width with no status message.
9. WHEN a Transaction is added or deleted, THE Dashboard SHALL recalculate and re-render the Progress_Bar and status message within 100 milliseconds.
10. WHEN a valid Spending_Limit is stored, THE Dashboard SHALL persist the Spending_Limit in browser LocalStorage so that it is restored on page reload.
11. IF LocalStorage is unavailable or returns a corrupt value when the page loads, THEN THE Dashboard SHALL treat the Spending_Limit as unset and display the "no limit" state from criterion 8.

---

### Requirement 9: Category Filter

**User Story:** As a student, I want to filter my transaction list by category, so that I can focus on one spending area at a time.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Category_Filter dropdown above the Transaction_List with options: All Categories, Food, Transport, Fun, and Other, defaulting to "All Categories" on page load.
2. WHEN the user selects a specific category in the Category_Filter, THE Transaction_List SHALL display only Transactions belonging to that category.
3. WHEN the user selects "All Categories" in the Category_Filter, THE Transaction_List SHALL display all Transactions.
4. WHEN no Transactions match the active Category_Filter selection, THE Dashboard SHALL display an empty-state message indicating that no transactions match the selected category.
5. WHEN a Transaction is added while a specific category filter is active, THE Dashboard SHALL display the new Transaction in the Transaction_List only if its category matches the active filter.

---

### Requirement 10: Data Persistence

**User Story:** As a student, I want my expenses and settings to survive a page refresh, so that I do not lose my data between sessions.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE Transaction_Manager SHALL serialise the entire transaction collection to LocalStorage under the key `pocketpulse_transactions`.
2. WHEN the Spending_Limit is updated, THE Dashboard SHALL persist the new value to LocalStorage under the key `pocketpulse_limit`.
3. WHEN the active theme is changed, THE Dashboard SHALL persist the theme identifier to LocalStorage under the key `pocketpulse_theme`.
4. WHEN the Dashboard initialises, THE Dashboard SHALL read all three LocalStorage keys and restore the transaction collection, spending limit, and theme to their last saved states; IF a key is absent, THE Dashboard SHALL use the corresponding default (empty transaction collection, no spending limit, light theme).
5. IF any LocalStorage key contains corrupt or unparseable data on initialisation, THEN THE Dashboard SHALL silently fall back to the default value for that key (empty collection, no limit, or light theme) rather than throwing an error.
6. IF a LocalStorage write operation fails (e.g., storage quota exceeded), THEN THE Dashboard SHALL display an error message to the user without rolling back the in-memory application state.

---

### Requirement 11: Dark / Light Mode

**User Story:** As a student, I want to switch between dark and light colour themes, so that the dashboard is comfortable to use in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL render in light mode by default on first load.
2. WHEN the Theme_Toggle button is clicked or keyboard-activated, THE Dashboard SHALL switch the active theme between light and dark modes.
3. WHEN the theme changes, THE Dashboard SHALL update all surface colours, text colours, border colours, and shadow values to match the active theme within 250 milliseconds.
4. WHEN the theme changes to dark mode, THE Dashboard SHALL update the Chart legend text colour to the designated dark-mode foreground colour.
5. WHEN the theme changes to light mode, THE Dashboard SHALL update the Chart legend text colour to the designated light-mode foreground colour.
6. WHEN the theme changes, THE Theme_Toggle SHALL display a moon icon (🌙) while light mode is active and a sun icon (☀️) while dark mode is active.
7. WHEN the Dashboard initialises after a previous visit, THE Dashboard SHALL apply the theme last selected by the user.

---

### Requirement 12: Responsive Layout

**User Story:** As a student, I want the dashboard to be usable on both desktop and mobile screens, so that I can log expenses from any device.

#### Acceptance Criteria

1. THE Dashboard SHALL display the Summary_Cards in a responsive grid that adjusts its column count based on available viewport width.
2. WHEN the viewport width is 640 pixels or greater, THE Dashboard SHALL render the Summary_Cards in a four-column layout (2fr 1fr 1fr 1fr).
3. WHEN the viewport width is below 640 pixels, THE Dashboard SHALL stack the Summary_Cards into a single-column layout.
4. WHEN the viewport width is 768 pixels or greater, THE Dashboard SHALL display the chart and transaction form side by side in a two-column layout.
5. WHEN the viewport width is below 768 pixels, THE Dashboard SHALL stack the chart and transaction form vertically.
6. THE Dashboard SHALL not introduce horizontal scroll at any viewport width of 320 pixels or above.
7. WHEN the viewport width is below 768 pixels, THE Dashboard SHALL render the spending limit section and Transaction_List in a single-column stacked layout.

---

### Requirement 13: Client-Side Only Implementation

**User Story:** As a student submitting an assignment, I want the application to run entirely in the browser without any server or build step, so that it can be evaluated by simply opening `index.html`.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using HTML5, CSS3, and vanilla JavaScript (ES2020) exclusively, with no JavaScript framework or library other than Chart.js v4.4.0 loaded from CDN.
2. WHEN `index.html` is opened directly from the local filesystem without a web server, THE Dashboard SHALL load without errors and all features (add transaction, delete, chart, theme toggle, spending limit) SHALL be fully functional.
3. THE Dashboard SHALL not make any outbound network requests at runtime other than the initial CDN load of Chart.js.
4. THE Dashboard SHALL store all application state (transactions, spending limit, and theme preference) in browser LocalStorage, with no server-side persistence layer.
5. IF the Chart.js CDN is unavailable, THEN THE Dashboard SHALL display a visible fallback message in the chart area indicating that the chart cannot be loaded.
