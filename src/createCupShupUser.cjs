const { createClient } = require('@supabase/supabase-js');

// 🚀 Connect to Supabase using Admin Access
const supabaseAdmin = createClient(
  "https://jfntmxbflpbeieuwwebz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbnRteGJmbHBiZWlldXd3ZWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzYyNTUxMSwiZXhwIjoyMDUzMjAxNTExfQ.BS-feCBNWIkjxKMwkQEnNOfKZ_15HlOBrBFeZyDmi-Q",
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// 🎯 Function to manually create a CupShup user
async function createCupShupUser() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: "akash@cupshup.co.in",
      password: "cupshup@1234",
      email_confirm: true,
      user_metadata: { role: "CupShup" }
    });

    if (error) {
      console.error("❌ Failed to create user:", error);
    } else {
      console.log("✅ User created successfully:", data);
      
      // Create profile entry
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            user_id: data.user.id,
            email: data.user.email,
            role: 'CupShup',
            name: 'Akash'
          }
        ]);
      
      if (profileError) {
        console.error("❌ Failed to create profile:", profileError);
      } else {
        console.log("✅ Profile created successfully");
      }
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// 🚀 Run the function
createCupShupUser(); 