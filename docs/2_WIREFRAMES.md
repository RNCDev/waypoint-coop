# Waypoint Phase 1: Basic Wireframes

## 1. Publisher Terminal (GP View)

### A. The "Composer" (Main Dashboard)
**Layout:** Split Screen (Left: Input, Right: Preview)

*   **Left Panel: Data Input**
    *   **Tabs:** `Smart Paste` | `Raw JSON`
    *   **Helper:** "Need a starting point? [Download Standard Excel Template]"
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
    *   **Metadata:** "Published by GP_Name at 10:42 AM via Waypoint. [Read Receipt Sent]"
    *   **Payload:** Read-only data table.
    *   **Tools:** [Download JSON] [Print/PDF]

### B. Delegation Center
**Layout:** Management List

*   **"My Delegates" Section:**
    *   List of external users (Auditors, Tax).
    *   Button: [Add Delegate] -> Form (Email, Scope).
    *   **Action:** System sends "Magic Link" to delegate email. No password setup required for read-only access.
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

---

## 4. Backend Architecture (Build Specs)

### A. Tech Stack (Demonstration Phase)
*   **Goal:** Visually stunning, fast, "silky smooth" interactions to impress funders/clients.
*   **Framework:** **Next.js (App Router)** - Handles both Frontend UI and lightweight Backend API routes.
*   **Styling:** **Tailwind CSS** - Utility-first styling for rapid layout.
*   **UI Components:** **shadcn/ui** - High-quality, accessible components (Radix UI + Tailwind) for a polished "Stripe-like" aesthetic.
*   **Animation:** **Framer Motion** - For smooth transitions, hover effects, and layout animations (making it feel "expensive").
*   **Database:** **SQLite** (via **Prisma ORM**) - Zero-config local file database (`waypoint.db`) that mimics a full SQL environment.
*   **Icons:** **Lucide React** - Clean, consistent vector iconography.

### B. Database (SQLite Schema)
*   **File:** `prisma/schema.prisma` -> `dev.db`
*   **Core Models:**
    *   `Organization`: ID, Name, Type (GP/LP/Delegate), ImageURL.
    *   `User`: ID, OrgID, Name, Email, Role.
    *   `Asset`: ID, OwnerID, Name, Type.
    *   `Envelope`: ID, PublisherID, AssetID, Status, Hash.
    *   `Payload`: ID, EnvelopeID, Data (JSON).

### C. Authentication (Mock)
*   **Strategy:** Simple "Persona Switcher" for the demo.
*   **Mechanism:** A global context allowing the user to "Act As" Alice (GP), Bob (LP), or Charlie (Auditor) instantly to demonstrate different views.
