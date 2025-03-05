import { createClient } from "@supabase/supabase-js";

// 🚀 Connect to Supabase using Admin Access
const supabaseAdmin = createClient(
  "https://jfntmxbflpbeieuwwebz.supabase.co", // Replace with your actual Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbnRteGJmbHBiZWlldXd3ZWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzYyNTUxMSwiZXhwIjoyMDUzMjAxNTExfQ.BS-feCBNWIkjxKMwkQEnNOfKZ_15HlOBrBFeZyDmi-Q", // Replace with your Supabase Service Role Key
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// 🎯 Function to manually create a CupShup user
async function createCupShupUser() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "nikhil@cupshup.co.in",  // Change this if needed
    password: "cupshup@1234",      // Change this if needed
    email_confirm: true,
    user_metadata: { role: "CupShup" } // Assigning role CupShup
  });

  if (error) {
    console.error("❌ Failed to create user:", error);
  } else {
    console.log("✅ User created successfully:", data);
  }
}

// 🚀 Run the function
createCupShupUser();
