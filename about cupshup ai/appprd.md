                         CupShup AI App 2025 PRD V1.0



1. Introduction
Problem Statement
CupShup, a marketing agency, requires an application to streamline the workflow between:
CupShup (the internal team managing projects/activities),
Clients (brands who commission CupShup),
Vendors (third-party service providers executing parts of the projects/activities).
Currently, tasks such as managing vendor details, assigning activities, and keeping track of client requirements can be manual or scattered across different tools, causing inefficiency and confusion.
Vision
The App will be used and monitored by three stakeholders, i.e., CupShup, Client and Vendor. The CupShup AI App provides a unified platform where:
CupShup can manage activities, projects, vendors, and clients from a single dashboard.
Vendor can sign up, view assigned activities, keep adding tasks to those activities and update progress. They can see on a dashboard tasks and activities worked upon
Client can see a dashboard that has details of the activities that CupShup is working on and tasks related to each activities
Through automation (magic links, automatic user creation) and an easy-to-use interface, CupShup can significantly reduce admin overhead and ensure smooth collaboration among all stakeholders.







2. Objectives & Goals
Centralized Management
Provide a single platform for CupShup team members to manage clients, vendors, and activities.
Seamless Onboarding
Make it easy to invite new vendors (or clients) via email—no complicated sign-up flows.
Role-Based Access
Ensure each stakeholder sees relevant data only (Vendors see all activities, assigned activities and tasks related to those assigned activities; Clients see their brand’s tasks; CupShup sees everything).
Automation & Efficiency
Use AI or OCR (via Google Cloud Vision) to help with tasks like extracting data from images or documents (Future).
Scalable Infrastructure
Leverage Supabase’s backend to handle data securely, while supporting future growth.

3. Target Users & Roles
CupShup (Internal Team)
Creates projects and activities.
Invites and manages vendors.
Oversees client projects and brand info.
Vendors
Receive invitations to the app. 
View assigned activities (including timelines, instructions).
Add tasks to activities assigned to them and update progress 
Clients
Receive invitations to the app. 
View brand’s activities (including timelines, instructions).
View tasks added for the activities of their brand only

4. Core Features for MVP
User Management & Invitations
CupShup can invite new vendors and clients by email (simple sign-up or direct creation in Supabase).
Automatic “magic link” emails for vendor and client sign-in.

Vendor Dashboard
Minimal interface where vendors see assigned activities, deadlines, and can mark progress.
Activity Creation & Assignment
CupShup user can create new activities (e.g., “Promotion at Event X”) and assign them to vendors.
Basic fields: name, city, location, start/end date, brand (client), status, message to vendor etc
Authentication & Role-Based Access
CupShup sees all data (all vendors, all activities).
Vendors see only assigned tasks.
Basic Communication
Allow CupShup to post instructions or messages in the activity details that vendors can read.
Vendors can comment or provide updates. (Could be minimal for MVP.)
      6.   Client Dashboard
Minimal interface where clients see tasks added to activities of their brand and all details of the activity
      7. OCR with Google Cloud Vision
For scanning vendor-submitted images (order id, invoices, activity proofs) and extracting text automatically.
Resend Email Templates & Notification
More advanced email workflows (e.g., daily activity summaries, vendor reminders). (Future Scope)
Analytics & Reporting
Dashboards showing cost, timeline compliance, or vendor performance metrics.(Future Scope)
Offline Mobile App
If vendors need to update status onsite without stable internet. (Future Scope)





6. User Journey
CupShup Team
Log in to CupShup AI App with Magic Link.
Create Activity specifying details (brand, city, location, start date, end date, contract value).
Invite Vendor by entering details (name, Email Id, Phone number) → vendor automatically created in Auth (and receives a magic link on their id).
Assign Activity to the vendor(s) (CupShup can assign a particular activity to a vendor or multiple vendors) through a drop down that lists all Vendors. It can also give Instructions to the vendor while assigning the activity
Vendor
Receives Email Invite with a magic link.
Logs in to see assigned activities.
Starts work on the activity. The vendor can add tasks to the activity assigned to him/her. The task has details like Customer Name, Customer Number, Order ID, Sales Items etc which the vendor adds.  
Client
Receives Email Invite with a magic link.
Logs in to see activities created for own brands only.
Has access to a dashboard which lists all activities and all tasks associated with those activities. The dashboard give insights about how tasks, activities and vendors


7. Tech Stack
Supabase:
Database & Auth for user management (CupShup, Vendors, Clients).
Edge Functions for invites, custom server logic, role-based control.
shadcn/ui:
Pre-built React components for a polished and consistent UI.
Google Cloud Vision API :
OCR features for vendors  to upload proof-of-delivery and invoices.
Resend :
Send out transactional emails or more complex flows than basic Supabase Auth emails.


8. Design

Brand Color - #00A979
Brand font - Montserrat and Roboto.
Maintain a mix of white and #00A979 across the App. Follow standard design principles.  

Summary
The MVP focuses on letting CupShup invite vendors, create and assign activities, and letting vendors see or update them.
The MVP also includes a client portal, OCR integrations for advanced workflows, and more sophisticated email/notification flows.
By prioritizing these MVP features, CupShup can quickly validate the solution’s value and gather feedback, then iteratively add more advanced functionalities.

