Below are three separate user journeys for the CupShup AI App, one per role (CupShup, Vendor, and Client). Each journey outlines the typical steps a user in that role takes—from login to completing their tasks within the system.

1. CupShup User Journey
Login (Magic Link or Password)
CupShup user visits the app’s login page.
Enters email → receives a magic link 
After successful authentication, the user is redirected to the CupShup Dashboard.
CupShup Dashboard
Sees an overview of current activities (projects), vendor statuses, and any high-level metrics.
Can quickly see how many activities are “in progress” or “completed.”
Inviting New Users
Invite Vendor:
Click “Invite Vendor”.
Provide vendor name, email, phone, and optionally a city.
The system sends an email invite (magic link).
Invite Client:
Similar flow: provide client name, email, maybe brand name.
Email invite is sent out.
Creating a New Activity
From the dashboard, clicks “Create Activity”.
Fills out name, city, location, start date, end date, brand/client.
Optionally adds instructions or a message about the activity.
Assigning a Vendor
After creating the activity, goes to “Assign Vendors” section.
Chooses one or more Vendors from a dropdown (populated by the vendor list).
Adds any specific instructions for that vendor.
Saves the assignment → the Vendor can now see this activity on their dashboard.
Monitoring and Updates
In the Activity Detail page, CupShup sees tasks created by vendors and their progress.
Can post additional instructions or update the activity status.
If the vendor uploads proof or data via OCR, CupShup can check extracted info here.
Client Overview
If a client is linked to the activity, CupShup can see which client is viewing it and confirm the brand details.
If needed, CupShup updates the client on progress via direct messages or instructions in the system.
Wrapping Up an Activity
Once tasks are done, CupShup marks the activity as “completed”.
The system can log final data or an invoice (future feature).

2. Vendor User Journey
Invite and Signup
Vendor receives an invite email with a magic link from CupShup.
Clicks the link to log in.
Lands on the Vendor Dashboard after successful authentication.
Vendor Dashboard
Sees a list of assigned activities (from the bridging table that CupShup created).
Each activity shows title, location, dates, and possibly status.
Viewing Activity Details
Click on an activity to view instructions from CupShup, brand info, or deadlines.
Possibly a comment/chat section if CupShup posted messages.
Adding Tasks
For each assigned activity, the Vendor can create tasks. Example:
Task details: “Order #1234,” “Customer name,” “Sales Items.”
Attach proof or data if needed.

Communication with CupShup (Future)
If the vendor has questions or updates, they can post them in the activity comments or instructions section.
Completing Assigned Activities
Once the Vendor has finished all tasks, they update statuses to “done” or inform CupShup via the system.
The activity remains in “completed” state from the vendor’s perspective, though CupShup must also confirm final completion.
Optional Future: OCR Workflow
Vendor uploads an invoice or proof-of-delivery image.
The system uses Google Cloud Vision to extract text and store it in a task record automatically.
Logging Out or Next Activity
Vendor may log out when done or proceed to another assigned activity.

3. Client User Journey
Invite and Login
A Client receives an invite email with a magic link from CupShup.
Clicks the link → logs in and lands on the Client Dashboard.
Client Dashboard
The client sees only the activities associated with their brand or user ID.
Overview: how many are “active,” “completed,” etc.
Activity Overview
Click on a specific activity to see:
Activity details (title, city, start/end date).
List of tasks added by vendors for that activity.
Possibly brand alignment info if needed.
Viewing Tasks
The client can’t typically edit tasks (depending on your business rules), but they can:
See the tasks vendor added: “Order #1234,” “Sales Items,” etc.
Check statuses: pending, done, etc.
Checking Progress
Optionally leave a comment or question about the activity (if you allow that interaction).
Typically, the client uses the system to stay informed about vendor progress.
Communication
If the client needs updates, they can post in an activity comment or message CupShup.
CupShup can respond or update the activity instructions.
Project Closure
Once CupShup marks the activity as “completed,” the client sees it in a “Completed Activities” list.
The client can confirm everything looks good or request changes.
Future Additions
Payment or invoice tracking, advanced analytics, brand-level insights, etc.

Summary of User Journeys
CupShup:
Logs in → sees a master dashboard.
Invites Vendors/Clients, creates activities, assigns vendors.
Monitors progress and completes the activity.
Vendor:
Gets an invite → logs in.
Sees assigned activities, adds tasks, updates progress.
Communicates with CupShup if needed.
Client:
Gets an invite → logs in.
Sees brand-specific activities and tasks.
Stays updated on the progress, can comment or request changes.
These journeys ensure each stakeholder can accomplish their tasks with minimal friction while CupShup retains full oversight.

