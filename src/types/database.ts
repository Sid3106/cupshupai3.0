export type UserRole = 'CupShup' | 'Vendor' | 'Client';
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Profile {
  user_id: string;
  role: UserRole;
  name: string;
  email: string;
  profile_photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  vendor_name: string;
  phone: string | null;
  city: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  name: string;
  client_id: string | null;
  city: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  instructions: string | null;
  status: ActivityStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  brand: string;
}

export interface ActivityAssignment {
  id: string;
  activity_id: string;
  vendor_id: string;
  instructions: string | null;
  assigned_at: string;
}

export interface Task {
  id: string;
  activity_id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  brand_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>;
      };
      vendors: {
        Row: Vendor;
        Insert: Omit<Vendor, 'id' | 'created_at'>;
        Update: Partial<Omit<Vendor, 'id' | 'created_at'>>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>;
      };
      activity_assignments: {
        Row: ActivityAssignment;
        Insert: Omit<ActivityAssignment, 'id' | 'assigned_at'>;
        Update: Partial<Omit<ActivityAssignment, 'id' | 'assigned_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}