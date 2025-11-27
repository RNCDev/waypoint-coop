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
*   **Framework:** **Next.js 14+ (App Router)** - Handles both Frontend UI and lightweight Backend API routes.
*   **Styling:** **Tailwind CSS** - Utility-first styling for rapid layout.
*   **UI Components:** **shadcn/ui** - High-quality, accessible components (Radix UI + Tailwind) for a polished "Stripe-like" aesthetic.
*   **Animation:** **Framer Motion** - For smooth transitions, hover effects, and layout animations (making it feel "expensive").
*   **Icons:** **Lucide React** - Clean, consistent vector iconography.
*   **State Management:** **Zustand** or **React Context** - For client-side state (persona switching, UI state).
*   **Forms:** **React Hook Form** - For form handling and validation.
*   **Data Parsing:** **Papa Parse** - For CSV/TSV parsing in Smart Paste feature.
*   **Date Handling:** **date-fns** - For date formatting and manipulation.

### B. Database & Storage Strategy
*   **Local Development:** **SQLite** (via **Prisma ORM**) - Zero-config local file database (`waypoint.db`).
    *   **File:** `prisma/schema.prisma` -> `dev.db`
    *   **Core Models:**
        *   `Organization`: ID, Name, Type (GP/LP/Delegate), ImageURL, Status.
        *   `User`: ID, OrgID, Name, Email, Role.
        *   `Asset`: ID, OwnerID, PublisherID, Name, Type.
        *   `Envelope`: ID, PublisherID, AssetID, AssetOwnerID, Timestamp, Version, Status, Hash, RecipientScope (JSON array).
        *   `Payload`: ID, EnvelopeID, Data (JSON blob).
        *   `Delegation`: ID, SubscriberID, DelegateID, AssetScope (JSON array), TypeScope (JSON array), Status, GPApprovalStatus.
        *   `ReadReceipt`: ID, EnvelopeID, UserID, ViewedAt.
*   **Vercel Deployment:** **In-Memory Storage** - Data resets on each serverless function invocation.
    *   Mock data seeded on each API route call for consistent demo experience.
    *   Simulates full database behavior without persistent storage complexity.

### C. Data Seeding Strategy
*   **Approach:** Always reset to mock data on startup/load for consistent demos.
*   **Local:** Seed script runs on `npm run dev` startup (or via flag: `npm run dev:seed`).
*   **Vercel:** Mock data loaded on each API route invocation.
*   **Source:** All mock data from `docs/3_MOCK_DATA.md` (Organizations, Users, Assets, Envelopes, Payloads, Delegations).

### D. Cryptographic Signing
*   **Phase 1 Approach:** **Simulated Signing** - Generate deterministic hash based on envelope + payload content.
*   **Implementation:** Use Node.js `crypto` module to create SHA-256 hash of `JSON.stringify(envelope + payload)`.
*   **Purpose:** Demonstrate immutability concept without full PKI infrastructure.
*   **Future:** Can be upgraded to real cryptographic signing (RSA/ECDSA) in later phases.

### E. Authentication (Mock)
*   **Strategy:** Simple "Persona Switcher" for the demo.
*   **Mechanism:** A global context allowing the user to "Act As" different personas instantly:
    *   **Alice Admin** (Publisher: Genii Admin Services)
    *   **Bob GP** (Asset Owner: Kleiner Perkins)
    *   **Charlie LP** (Subscriber: State of Ohio Pension)
    *   **Dana Delegate** (Auditor: Deloitte)
*   **UI:** Dropdown/selector in top navigation bar for instant role switching.
*   **No Password:** All personas accessible for demo purposes.

### F. Deployment
*   **Local:** `npm run dev` - Full Next.js dev server with SQLite database.
*   **Vercel:** Automatic deployment via GitHub integration (RNCDev account).
    *   Serverless API routes with in-memory storage.
    *   Pre-rendered static pages where possible.
    *   Zero-config deployment on push to main branch.
