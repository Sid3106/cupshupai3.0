import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.1?target=deno";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    // Parse JSON body
    const { email, vendorName, phone, city } = await req.json();

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Create new auth user with Vendor role and metadata
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "cupshup@1234",
      user_metadata: { 
        role: "Vendor",
        name: vendorName,
        phone,
        city,
        is_invited: true
      },
      email_confirm: true,
    });

    if (createUserError) throw createUserError;

    const userId = userData.user?.id;
    if (!userId) {
      throw new Error("No user ID returned from createUser");
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        userId,
        message: `Vendor ${vendorName} invited!`
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
      }
    );

  } catch (err) {
    console.error("Error in invite-vendor function:", err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'An error occurred'
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
      }
    );
  }
});