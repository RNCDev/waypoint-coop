# Waypoint Phase 1: Basic Wireframes

## 1. Publisher Terminal (GP View)

### A. The "Composer" (Main Dashboard)
**Layout:** Split Screen (Left: Input, Right: Preview)

*   **Left Panel: Data Input**
    *   **Tabs:** `Smart Paste` | `Raw JSON`
    *   **Action Area:** Large text area. Placeholder: "Paste Excel data here..."
    *   **Controls:** [Clear] [Parse Data]

*   **Right Panel: Validation Preview**
    *   **Visual:** HTML Table rendering the parsed JSON.
    *   **Status:** "Valid JSON" (Green Check) or "Syntax Error" (Red Alert).

*   **Bottom Bar: The Envelope**
    *   **Dropdown:** `Publisher Entity` (e.g., "Genii Admin") - *Auto-filled*
    *   **Dropdown:** `On Behalf Of` (e.g., "Kleiner Perkins") - *If applicable*
    *   **Dropdown:** `Select Asset` (e.g., "Fund IV", "Co-Invest A")
    *   **Input:** `Tags` (Optional metadata: "Q3", "CapCall")
    *   **Toggle:** `Embargo Release` (Optional date picker)
    *   **Primary Button:** [SIGN & PUBLISH] (High contrast color)

### B. Published History
**Layout:** Data Table

*   **Columns:**
    *   ID
    *   Date Sent
    *   Asset
    *   Tags
    *   Version (v1, v2)
    *   Status (Delivered, Revoked)
    *   Actions (View, Correct, Revoke)

---

## 2. Subscriber Ledger (LP View)

### A. The "Inbox" (Main Dashboard)
**Layout:** Single-stream Feed (Twitter/Newsfeed style)

*   **Header:** Global Search & Filters (By Fund, By Type, Date Range).
*   **Feed Item (Card):**
    *   **Top Line:** [Fund Name] • [Date] • [Type]
    *   **Status Badge:** `Verified Publisher`
    *   **Action:** [Expand Details]
*   **Expanded View:**
    *   **Metadata:** "Published by GP_Name at 10:42 AM via Waypoint."
    *   **Payload:** Read-only data table.
    *   **Tools:** [Download JSON] [Print/PDF]

### B. Delegation Center
**Layout:** Management List

*   **"My Delegates" Section:**
    *   List of external users (Auditors, Tax).
    *   Button: [Add Delegate] -> Form (Email, Scope: "Tax Data Only", Fund: "All").
    *   Status: "Pending GP Approval", "Active", "Rejected".

---

## 3. Admin Console (Waypoint View)

### A. The Switchboard
**Layout:** Dashboard Metrics

*   **Live Ticker:** "Packet #8921 processed: GP_A -> LP_B"
*   **Health:** API Latency, Error Rates.

### B. Entity Registry
**Layout:** Searchable Directory

*   **Tabs:** `Organizations` | `Users`
*   **Org Detail:**
    *   Name, Address, Tax ID.
    *   Status: `Verified`, `Pending`, `Suspended`.
    *   Linked Funds.

