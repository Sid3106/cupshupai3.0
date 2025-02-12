1. Common / Shared Screens
Login (Magic Link) Screen
Purpose: Allows users (CupShup, Vendors, or Clients) to enter their email and request a magic link for authentication.
Key Elements:
Email input field.
“Send Magic Link” button.
Confirmation message (“Check your email for a magic link”).
Magic Link Confirmation Screen (Optional)
Purpose: Tells the user they’ve successfully accessed the app via a magic link, or handles errors (e.g., expired link).
Key Elements:
Basic success/failure messaging.
Profile Settings / Account Management (Optional for MVP)
Purpose: Each user can view/update basic profile info (name, photo, phone, etc.).
Key Elements:
Profile picture or name display.
Fields to edit phone, city, role (if applicable).

2. CupShup (Internal Team) Screens
2.1 CupShup Dashboard
Purpose: Main landing page after CupShup logs in. Summarizes key info:
Recent Activities created.
List of Vendors and Clients.
Quick links to invite or create new activity.
Key Elements:
Activity overview (counts by status).
“Invite Vendor” or “Invite Client” button.
2.2 Invite Vendor / Client Screen
Purpose: Let CupShup user fill out the new vendor’s (or client’s) name, email, phone.
Key Elements:
Fields: Name, Email, Phone, optional City.
“Send Invitation” button triggers the magic link flow or admin user creation in Supabase.
2.3 Activities Management
Activity List Screen
Purpose: List all activities with columns (name, brand, start date, end date, assigned vendors).
Key Elements:
Filter/search bar (by brand, city, etc.).
“Create New Activity” button.
Activity Creation / Edit Screen
Purpose: CupShup can create or edit an activity.
Key Elements:
Fields: Activity Name, Brand, City, Location, Start/End date, contract value, optional instructions.
Dropdown or multi-select for assigned Vendors.
A text area for CupShup to add messages or instructions.
2.4 Vendor / Client Management
Vendor List Screen
Purpose: CupShup sees a table of all vendors.
Key Elements:
Basic vendor info (name, email, phone).
“Invite New Vendor” button (goes to the Invite Vendor flow).
Client List Screen
Purpose: CupShup sees a table of all clients.
Key Elements:
Basic client info (brand name, contact email, phone).
“Invite New Client” button (similar flow to vendors).
2.5 Activity Detail / Instructions Screen
Purpose: CupShup can view an individual activity’s details, see the assigned vendors, and add or modify instructions.
Key Elements:
Activity info (title, brand, city, date range).
Discussion/comment area for instructions or updates.
Vendor assignments, tasks added by vendor (read-only or partial edit access).

3. Vendor Screens
3.1 Vendor Dashboard
Purpose: Main screen after a vendor logs in. Shows a quick overview of assigned activities, tasks, and statuses.
Key Elements:
List of assigned activities with statuses (active, completed, etc.).
Possibly a “Notifications” or “Unread instructions” count.
3.2 Activity Detail & Task Management
Assigned Activity Detail
Purpose: Vendor clicks on a specific activity to see instructions, deadlines, brand info, etc.
Key Elements:
Activity name, location, dates, CupShup instructions.
A place to see or post comments/updates.
Add / Manage Tasks
Purpose: Vendor can add tasks under that activity (e.g., “Reached out to X client,” “Order ID #1234,” “Proof of Delivery,” etc.).
Key Elements:
Task fields like Order ID, Customer Name, Items, etc.
Ability to mark tasks done or in-progress.
3.3 Proof Submission / OCR (Future)
Purpose: If you implement Google Cloud Vision in the future, a screen to upload images and display extracted text.
Key Elements:
File upload button.
Show extracted text results.

4. Client Screens
4.1 Client Dashboard
Purpose: On login, the client sees an overview of brand-specific activities.
Key Elements:
List of Activities for that brand (with statuses).
Possibly a quick summary of vendor tasks or progress.
4.2 Activity & Tasks View
Purpose: Client clicks into an activity to see tasks, vendor updates, or progress.
Key Elements:
Activity details (title, location, instructions from CupShup).
All tasks that vendor has added for that activity.
Possibly a read-only or limited comment area.

5. Additional / Future Screens
Analytics / Reporting Dashboard (Future)
Graphs or charts summarizing tasks, vendor performance, costs, etc.
Notification / Email Templates (Resend)
Where CupShup can configure advanced email flows (not necessarily a front-end screen, but an admin config page or partial UI might exist).

Summary
These screens collectively cover the entire user journey for CupShup, Vendors, and Clients:
Login & Invite for each role
Dashboards for an at-a-glance view of tasks/activities
Detailed views (Activities, tasks, instructions)
Vendor & Client specific flows
Optional advanced screens for OCR, analytics, or notifications
By implementing these screens, you’ll achieve the essential functionality outlined in your PRD for the CupShup AI App.

