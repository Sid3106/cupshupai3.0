High-Level Overview
auth.users – Managed by Supabase for authentication (emails, passwords/magic links).
profiles – Extends auth.users to store roles (CupShup, Vendor, Client) and contact info.
activities – Represents each marketing activity or project.
activity_assignments – Maps multiple Vendors to an Activity (a many-to-many relationship).
tasks – Tracks tasks that Vendors add to assigned Activities.
 clients – If you want to store more complex brand data. Otherwise, you can store client brand info directly in profiles or activities.
Because you now want a Client screen in the MVP, the Client role is no longer optional. We’ll integrate them into the same “profiles” table with role='Client'. This ensures each user can log in with a magic link or password, and we can unify the user roles in one place.

1. auth.users (Supabase Auth)
Purpose: Stores minimal authentication details (email, hashed password, etc.).
Key Fields (created by Supabase):
id (UUID) – Primary key for each user
email (Text) – Unique email
created_at, updated_at
Relationship:
profiles.user_id = auth.users.id
You generally do not modify auth.users directly. Instead, you let Supabase handle user creation and logins.

2. profiles
Purpose: Extends auth.users with role-based data (CupShup, Vendor, Client) and personal details.
Key Fields:
user_id (UUID, PK) – references auth.users(id) (1:1 relationship).
role (Text or Enum) – e.g. 'CupShup' | 'Vendor' | 'Client'.
name (Text) – Display name or brand name.
phone (Text).
city (Text).
created_at, updated_at (Timestamp).
Usage:
Distinguish each user type:
If role='CupShup', they manage the app.
If role='Vendor', they see assigned activities, add tasks.
If role='Client', they see brand’s activities and related tasks.
For Clients, you can store brand-specific info in a separate column (e.g., brand_name) or create a dedicated clients table if you want more advanced brand data.

3. activities
Purpose: Represents each marketing activity or project. CupShup creates these; Vendors see them if assigned; Clients can see only the ones related to their brand or assigned to them.
Key Fields:
id (UUID, PK).
name (Text).
client_id (UUID, references profiles.user_id where role='Client') OR a simple brand text field, depending on how you want to link.
city (Text).
location (Text).
start_date, end_date (Timestamp).
instructions (Text).
status (Text or Enum) – 'pending' | 'in_progress' | 'completed', etc.
created_by (UUID, references profiles.user_id for a CupShup user).
created_at, updated_at.
If you want direct linking to a Client user, use client_id = profiles.user_id. If you just want a brand name, store brand text.

4. activity_assignments
Purpose: A bridging table for a many-to-many between activities and vendors. One activity can have multiple vendors, and each vendor can be assigned multiple activities.
Key Fields:
id (UUID, PK).
activity_id (UUID, references activities.id).
vendor_id (UUID, references profiles.user_id where role='Vendor').
instructions (Text) – Extra instructions for this vendor on this activity, if needed.
assigned_at (Timestamp, default now()).
Usage:
A Vendor sees all activities from activity_assignments where vendor_id = vendor’s user_id.
CupShup can add multiple vendor entries here for the same activity.

5. tasks
Purpose: Holds tasks created by Vendors for assigned Activities. Clients can view tasks that belong to their brand’s activity.
Key Fields:
id (UUID, PK).
activity_id (UUID, references activities.id).
vendor_id (UUID, references profiles.user_id where role='Vendor').
title (Text) – e.g., “Order #1234”.
description (Text) – detailed text, e.g., “Sales Items: 2 units, invoice attached, etc.”
status (Text or Enum) – 'pending' | 'in_progress' | 'done'.
created_at, updated_at (Timestamp).
Usage:
The vendor can only create tasks for an activity they’re assigned to (via activity_assignments).
Clients see tasks for activities where activities.client_id = client’s user_id.

6. Optional clients Table
(Only if you want advanced brand details separate from profiles.)
If you prefer a dedicated table storing more brand fields:
Key Fields:
id (UUID, PK).
user_id (UUID, references profiles.user_id with role='Client').
brand_name (Text).
phone, address, etc.
created_at, updated_at.
Relationship:
activities.client_id references clients.id instead of referencing profiles.
This is optional—some teams just store brand_name in profiles.

Entity Relationship Diagram (Simplified)
plaintext
Copy
auth.users (Supabase)
  |
  +-- (1:1)
  v
profiles [ user_id PK, role, name, phone, city, created_at... ]
   | \
   |  \    (M:N with vendors)
   |   \
   v    v
activities [ id PK, client_id (FK->profiles.user_id, role='Client'), name, ... ]
   ^                \
   |(1:M)            \ (M:N) -> activity_assignments
   |                  \
   +------ tasks [ id, activity_id, vendor_id, ...]
   
activity_assignments [ id, activity_id, vendor_id, ... ]

Optional: clients [ id PK, user_id -> profiles(user_id), brand_name... ] 


Usage Scenarios
CupShup (role='CupShup')
Creates an activity → record in activities.
Invites vendor → new user in auth.users, profiles(role='Vendor').
Assign vendor to activity → record in activity_assignments.
Vendors (role='Vendor')
See assigned activities via activity_assignments.
For each activity, they can create tasks in tasks.
Clients (role='Client')
See activities where activities.client_id = user_id.
See tasks within those activities (via tasks.activity_id).

Security & RLS Considerations
Row-Level Security (RLS) can ensure:
Vendors only see tasks or assignments where vendor_id = auth.uid().
Clients only see activities matching activities.client_id = auth.uid() and tasks for those activities.
CupShup sees everything.

Conclusion
This design supports three roles (CupShup, Vendor, Client) within a single profiles table referencing auth.users. Vendors and Clients can be “invited” with straightforward relationships to activities and tasks. If you need more detailed brand data for clients, an optional clients table can be added, but the simplest route is storing brand info in profiles or referencing the client user id in activities.

