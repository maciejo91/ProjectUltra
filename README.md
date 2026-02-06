# ProjectUltra CRM

## Project Overview

A Vue 3-based CRM application for automotive dealerships with unified task management for leads and opportunities, including vehicle tracking, offer management, appointment scheduling, and sales workflow automation.

## Tech Stack

- **Frontend**: Vue 3 (Composition API with `<script setup>`), Pinia, Vue Router, Tailwind CSS
- **Calendar**: FullCalendar Vue component
- **Deployment**: Netlify (builds from source: `npm run build`)
- **Architecture**: Component-based with centralized mock data layer, reusable widgets, composables for shared logic
- **Icons**: Font Awesome
- **Build Tool**: Vite

## Prerequisites

- **Node.js** (LTS version recommended)
- **AWS CLI** configured with access to CodeArtifact
  - Required for accessing private npm packages from MotorK's CodeArtifact repository
  - Ensure AWS credentials are configured: `aws configure`
  - The build process will automatically authenticate with CodeArtifact before installation

## Quick Start

### First Time Setup

1. **Configure AWS CLI** (if not already configured):
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and region (eu-west-1)
   ```

2. **Run setup script** (automatically authenticates with CodeArtifact):
   ```bash
   npm run setup
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```
   
   **Note**: If you have AWS CLI configured, authentication will run automatically before `npm install` via the `preinstall` hook.

4. **Start the app**:
   ```bash
   npm run dev
   # Visit: http://localhost:5173/
   ```

### Manual CodeArtifact Authentication

If you need to authenticate manually:
```bash
npm run setup
# or
npm run auth:codeartifact
```

### Building for Production
```bash
npm run build  # Automatically authenticates before building
# Creates dist/ folder for deployment
```

### Navigation
- **Left Sidebar**: Icon-based navigation between sections
- **Tasks**: Unified view for leads and opportunities (`/tasks`)
- **Pipeline**: Kanban-style sales funnel (`/pipeline`)
- **Calendar**: FullCalendar integration (`/calendar`)
- **Reports**: Dashboard with KPIs (`/reports`)

### Testing Different Views
- **Tasks**: Click any task in the left sidebar to view details
- **Pipeline**: View sales stages and conversion metrics
- **Calendar**: Create events, drag-and-drop scheduling
- **Reports**: View team performance and analytics
Key Architecture Patterns
1. Unified Task System
Single View: TaskDetail.vue handles both leads and opportunities
Route: /tasks/:id?type=lead or /tasks/:id?type=opportunity
Composite Selection: Uses { id, type } to uniquely identify tasks across stores
Shared Shell: TaskShell.vue provides common layout (contact info, stage bar, tabs, add new button, feed)
2. Component Hierarchy
TaskDetail.vue (router entry)  └─ EntityListSidebar.vue (task list)  └─ TaskDetailContent.vue (decides which config/widgets to use)      └─ TaskShell.vue (shared layout shell)          ├─ ContactInfo.vue          ├─ StageOwnerBar.vue          ├─ LeadManagementWidget.vue OR OpportunityManagementWidget.vue          ├─ Feed widgets (VehicleWidget, OffersCarousel, etc.)          └─ Inline widgets (NoteWidget, AttachmentWidget, etc.)
3. Reusable Composables
useTaskInlineWidgets.js: Centralizes inline widget state and handlers (add/edit/delete activities, show/hide widgets, tab filtering)
useTaskTabs.js: Maps activity types to tabs (note, communication, attachment, overview)
4. Store Adapters
Both useLeadsStore and useOpportunitiesStore expose:
currentActivities (computed)
addActivity(taskId, data)
updateActivity(taskId, activityId, data)
deleteActivity(taskId, activityId)
Core Features
Leads
Management Widget: LeadManagementWidget.vue
Call simulation with live transcription
Extract info from transcription (adds notes, trade-ins, financing)
Postpone/reschedule
Create opportunity from lead
Overview Add New Actions: Trade-in, Financing, Requested Car (modals)
Tabs: Overview, Notes, Communication, Attachment
Opportunities
Management Widget: OpportunityManagementWidget.vue
Vehicle Actions (grouped):
Add requested vehicle to opportunity
Add vehicle from stock (Coming Soon modal)
Configure vehicle (Coming Soon modal)
Create offer (modal with requested/recommended cars)
Time-Based Task Widgets (conditional rendering):
OOFB (Open Opportunity Feedback): Qualified stage, 7-13 days, no offers
UFB (Unsold Feedback): Qualified stage, 14+ days, no offers
NFU (No Follow-Up): In Negotiation, X days, no contract, no future appointment
OFB (Offer Feedback): In Negotiation (Offer Under Review only), X days, no contract (shown in expanded view, not as primary status)
CFB (Contract Feedback): Contract date set, 7+ days, no delivery
DFB (Delivery Feedback): 3+ days after delivery date
Risk Warning: Shows if Qualified opportunity with appointment is taking too long
Appointment Widget: Shows confirmed/scheduled appointments with postpone toggle
Stages: Qualified → In Negotiation (Offer Sent) → In Negotiation (Offer Under Review) → Offer Accepted → In Negotiation (Contract Pending) → Closed Won
Overview Pinned: Management widget, Offers carousel (if any), Requested car
Tabs: Overview, Notes, Communication, Attachment
Shared Functionality
Hot Flag: Mark/unmark tasks as hot (works for both leads and opportunities)
Requested Car: VehicleWidget.vue - shows car details, stock status, request message
Offers: OffersCarousel.vue - horizontal carousel with main offer badge
Recommended Cars: RecommendedCarsSlider.vue - shows alternatives with "Add to opportunity" CTA (creates offer)
Activities: Notes, Attachments, Communications (email/SMS/WhatsApp), Trade-ins, Financing, Appointments
Feed: All activities displayed as FeedItemCard.vue with edit/delete actions
Contact Info: ContactInfo.vue - expandable card with contact actions (call, email, WhatsApp, SMS)
Critical Business Logic
Offer Creation Triggers Stage Transition
Adding any vehicle (requested, from stock, configured, or recommended) to an opportunity automatically:
Creates an offer with that vehicle
Transitions opportunity from "Qualified" → "In Negotiation (Offer Sent)"
After 3 days: Auto-transitions to "In Negotiation (Offer Under Review)"
Offer Acceptance: User can manually mark offer as accepted → "Offer Accepted" status
Contract Creation: Can auto-accept offer when creating contract (fast deal path)
Contract Deletion: If contract was auto-accepted, reverts to "Offer Under Review"
OFB Task: Only triggers from "Offer Under Review" status, shown in expanded view (not as primary status)
Appointment Confirmed = Remove Schedule CTA
If appointment status is "confirmed", hide "Schedule appointment" button
Show AppointmentWidget in the feed instead
Time-Based Task Priority
Risk Warning > UFB > OOFB > NFU > OFB > CFB > DFB
Key Components
Shared (src/components/shared/)
TaskShell.vue - Unified task layout shell
ContactInfo.vue - Expandable contact card
StageOwnerBar.vue - Stage/owner/source/probability chips
AddNewButton.vue - Context-aware dropdown (changes actions per tab/type)
VehicleWidget.vue - Requested car display
ComingSoonModal.vue - Placeholder modal
ActivitySummarySidebar.vue - Right sidebar with activity timeline
EntityListSidebar.vue - Left sidebar task list
Tabs.vue - Tab component with counts
Widgets (src/components/widgets/)
NoteWidget.vue, AttachmentWidget.vue, CommunicationWidget.vue
TradeInWidget.vue, FinancingWidget.vue
OfferWidget.vue - Create/edit offers (shows requested/recommended cars)
AppointmentWidget.vue - Display appointment details in feed
OffersCarousel.vue - Horizontal carousel of offers
RecommendedCarsSlider.vue - Horizontal carousel of in-stock alternatives
Opportunity Task Widgets (src/components/opportunities/)
OpportunityManagementWidget.vue - Main opportunity action hub
OOFBWidget.vue, UFBWidget.vue, NFUWidget.vue, OFBWidget.vue, CFBWidget.vue, DFBWidget.vue
Lead Management
LeadManagementWidget.vue - Call/transcription/postpone/create opportunity
Feed
FeedItemCard.vue - Unified feed card renderer (handles all activity types)
Styling Rules (Tailwind)
NO arbitrary values (w-[350px], text-[14px]) - use semantic classes only
Colors: text-primary, bg-surface, border-border (from tailwind.config.js)
Spacing: Use standard scale (p-4, gap-6, mt-8)
Mobile-first: class="flex flex-col md:flex-row"
No rounded corners on square buttons: Overview "Add New" button is blue and square; other tabs have gray rounded buttons
Data Layer (src/api/mockData/)
All sample entities organized in separate files: mockLeads, mockOpportunities, mockVehicles, mockEvents
Mock data is split into organized files by entity type (users, customers, leads, opportunities, tasks, contacts, vehicles, calendar, activities, dashboard)
All opportunity.stage values: "Qualified", "In Negotiation", "Closed Won" (never "Open")
All contacts have address field
All opportunities have priority field (supports hot flag)
Activities array includes: notes, calls, emails, trade-ins, financing, appointments, etc.
Routing
/tasks - Main task list view
/tasks/:id?type=lead - Lead task detail
/tasks/:id?type=opportunity - Opportunity task detail
/pipeline - Kanban-style pipeline view
/calendar - FullCalendar with filters and connection modal
/reports - Reports dashboard (formerly "Dashboard")
Recent Refactors
Unified Leads & Opportunities into single Tasks view
Extracted TaskShell.vue to eliminate duplication between LeadContent.vue and OpportunityContent.vue
Created composables (useTaskInlineWidgets, useTaskTabs) for shared logic
Deleted redundant views: Leads.vue, Opportunities.vue, LeadDetail.vue, OpportunityDetail.vue, LeadContent.vue, OpportunityContent.vue, old dashboard files
Removed console.log statements and unused code across the project
Calendar refactor: Extracted CalendarConnectModal.vue
Code organization: Split large files (LQWidget, Tasks.vue, LeadManagementWidget, stageMapper, mockData) into organized modules and composables
## Data Layer

All sample entities are in `src/api/mockData.js`:
- `mockLeads` - Lead data with customer info and requested vehicles
- `mockOpportunities` - Opportunity data with stages and vehicles
- `mockVehicles` - Vehicle inventory
- `mockContacts` - Contact database
- `mockCalendarEvents` - Calendar appointments and events

### Replacing Mock Data with Real API

The API layer is ready for backend integration. Simply replace functions in `src/api/*.js` files:

```javascript
// Example: src/api/leads.js
export const fetchLeads = async (filters) => {
  // Replace mock data with real API call
  return axios.get('/api/leads', { params: filters })
}
```

No changes needed in components or stores - they already use the API layer.

## Build & Deploy

- **Local**: `npm run build` (creates `dist/`)
- **.gitignore**: Excludes `node_modules`, `dist/`, log files

### Deploying on Netlify

Build is configured in `netlify.toml` (publish `dist/`, custom build command with CodeArtifact auth). No need to set build command or publish directory in the Netlify UI—they are in the repo.

**Checklist before first deploy:**

1. **Environment variables** (Site settings → Environment variables):
   - `AWS_ACCESS_KEY_ID_MK` – AWS access key with CodeArtifact access
   - `AWS_SECRET_ACCESS_KEY_MK` – AWS secret key  
   Optional: `AWS_DEFAULT_REGION` (defaults to `eu-west-1` in `netlify.toml`).

2. **Node version**: Netlify uses Node 22 (set in `netlify.toml`; matches `.nvmrc`).

3. **Build**: The build command in `netlify.toml` restores `_package.json` / `_package-lock.json` → `package.json` / `package-lock.json`, installs AWS CLI if needed, gets a CodeArtifact token, runs `npm install` and `npm run build`. No extra Netlify build command needed.

4. **Branch**: Deploy from `main` (or set your production branch in Netlify).

5. **SPA routing**: `netlify.toml` includes a catch-all redirect so client-side routes work.

## Troubleshooting

### If `npm install` fails with CodeArtifact errors:

**Error: `npm ERR! code E401` or `npm ERR! Unable to authenticate`**

This means AWS CodeArtifact authentication is required. Follow these steps:

1. **Install AWS CLI** (if not installed):
   ```bash
   # macOS
   brew install awscli
   
   # Linux/Windows: See https://aws.amazon.com/cli/
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and region (eu-west-1)
   ```
   
   Or set environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret
   export AWS_DEFAULT_REGION=eu-west-1
   ```

3. **Run setup script**:
   ```bash
   npm run setup
   ```

4. **Then install dependencies**:
   ```bash
   npm install
   ```

**Note**: The `preinstall` hook will automatically attempt authentication if `.npmrc` doesn't exist, but you still need AWS CLI and credentials configured.

### If server isn't running:
```bash
npm run dev
```

### If you see other errors:
```bash
npm install
npm run dev
```

### To rebuild from scratch:
```bash
rm -rf node_modules .npmrc
npm run setup
npm install
npm run dev
```

## Project Status

- ✅ Unified task system (leads + opportunities)
- ✅ Time-based task widgets (OOFB, UFB, NFU, OFB, CFB, DFB, NS)
- ✅ Survey/feedback system
- ✅ Close as Lost functionality
- ✅ Requalify/Reopen CTAs
- ✅ Registration stage workflow
- ✅ Hot flag functionality for leads and opportunities
- ✅ Mock data layer ready for API replacement

## Notes

- All cursor project rules are documented in `.cursor/rules/project-ultra-rules.mdc`
- Opportunity lifecycle workflow is fully implemented with time-based task triggers
- Component architecture follows Vue 3 Composition API best practices