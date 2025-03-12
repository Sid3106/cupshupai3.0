// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1?target=deno";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

console.log("Function starting...");

// Log environment check (without exposing values)
console.log("Environment check:", {
  hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
  hasServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  urlLength: Deno.env.get("SUPABASE_URL")?.length,
  keyLength: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.length
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing environment variables:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceKey
      });
      throw new Error("Server configuration error: Missing required environment variables");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    const body = await req.json();
    console.log("Request body:", body);

    const { email, name, phone, city } = body;

    // Validate input
    if (!email || !name) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          context: { email, name }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create user with minimal data
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "cupshup@1234",
      email_confirm: true,
      user_metadata: {
        role: 'Client',
        name,
        phone,
        city
      }
    });

    if (createUserError) {
      console.error("User creation error:", createUserError);
      throw createUserError;
    }

    if (!userData?.user?.id) {
      throw new Error("User created but no ID returned");
    }

    const userId = userData.user.id;
    
    // Call our function to create profile and client
    const { data: profileData, error: profileError } = await supabaseAdmin.rpc(
      'create_profile_and_client',
      {
        p_user_id: userId,
        p_email: email,
        p_name: name,
        p_phone: phone,
        p_city: city,
        p_role: 'Client'
      }
    );
    
    if (profileError) {
      console.error("Profile/client creation error:", profileError);
      // Continue anyway since the user was created
    } else {
      console.log("Profile/client creation result:", profileData);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        userId,
        message: "Client account created successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("Error in test-client-invite:", err);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : "An error occurred"
      }),
      { 
        status: err.status || 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/test-client-invite' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
