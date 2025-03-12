import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1?target=deno";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define valid brand names
const VALID_BRAND_NAMES = [
  "Amazon",
  "Flipkart",
  "DCB Bank",
  "Spencers",
  "Tata 1mg",
  "HDFC Life",
  "Apnamart"
] as const;

type BrandName = typeof VALID_BRAND_NAMES[number];

// Log environment variables at startup (without exposing sensitive values)
console.log('Environment variables check:', {
  timestamp: new Date().toISOString(),
  hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
  hasServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseUrlLength: Deno.env.get("SUPABASE_URL")?.length,
  serviceKeyLength: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.length
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

// Add a flag to bypass auth for testing
const BYPASS_AUTH = true;

function generateRandomPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

serve(async (req) => {
  console.log('Request received:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://jfntmxbflpbeieuwwebz.supabase.co";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbnRteGJmbHBiZWlldXd3ZWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzQxNTM2MDAwfQ.Wd_oGGOOPFXOBXBfBgpYgUVxNFZ6_Gy_Pu3Yw5Ue_Yw";

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing environment variables:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!serviceKey
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    const body = await req.json();
    console.log('Raw request body:', body);

    const { email, name, brandName, phone, city } = body;

    // Log input validation
    console.log('Request received:', {
      timestamp: new Date().toISOString(),
      email,
      name,
      brandName,
      hasPhone: !!phone,
      hasCity: !!city,
      rawBody: body
    });

    // Validate input
    if (!email || !name || !brandName) {
      console.log('Validation failed:', {
        timestamp: new Date().toISOString(),
        hasEmail: !!email,
        hasName: !!name,
        hasBrandName: !!brandName
      });
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          context: { email, name, brandName }
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!brandName || !VALID_BRAND_NAMES.includes(brandName as BrandName)) {
      throw new Error(`Invalid brand name. Must be one of: ${VALID_BRAND_NAMES.join(', ')}`);
    }

    // Test auth connection and check for existing user
    console.log('Checking for existing user:', {
      timestamp: new Date().toISOString(),
      email
    });

    const { data: existingUser, error: emailCheckError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (emailCheckError) {
      console.error('Email check error:', {
        timestamp: new Date().toISOString(),
        error: emailCheckError
      });
      throw new Error(`Database error checking email: ${emailCheckError.message}`);
    }

    if (existingUser) {
      console.log('User already exists:', {
        timestamp: new Date().toISOString(),
        email
      });
      throw new Error('Email already exists');
    }

    // Create user with minimal data first
    console.log('Creating user with minimal data:', {
      timestamp: new Date().toISOString(),
      email
    });

    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "cupshup@1234",
      email_confirm: true,
      user_metadata: {
        role: 'Client',
        name,
        phone,
        brand_name: brandName
      }
    });

    if (createUserError) {
      console.error('User creation error:', {
        timestamp: new Date().toISOString(),
        error: createUserError,
        context: {
          message: createUserError.message,
          status: createUserError.status,
          name: createUserError.name
        }
      });
      throw createUserError;
    }

    if (!userData?.user?.id) {
      console.error('No user ID returned:', {
        timestamp: new Date().toISOString(),
        userData
      });
      throw new Error('User created but no ID returned');
    }

    const userId = userData.user.id;
    console.log('User created successfully:', {
      timestamp: new Date().toISOString(),
      userId
    });

    // Now update the user with metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role: "Client",
          name,
          brand_name: brandName,
          phone,
          city,
          is_invited: true
        },
        app_metadata: {
          provider: 'email',
          role: 'Client'
        }
      }
    );

    if (updateError) {
      console.error('Error updating user metadata:', {
        timestamp: new Date().toISOString(),
        error: updateError
      });
      // Clean up by deleting the user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw updateError;
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        role: "Client",
        name,
        email,
        phone: phone ? parseInt(phone) : null,
        city,
        raw_user_meta_data: {
          role: "Client",
          name,
          brand_name: brandName,
          phone,
          city
        }
      });

    if (profileError) {
      console.error('Error creating profile:', {
        timestamp: new Date().toISOString(),
        error: profileError
      });
      // Clean up by deleting the user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        userId,
        message: "Client invited successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error('Error in invite-client:', {
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? {
        message: err.message,
        name: err.name,
        stack: err.stack
      } : 'Unknown error'
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'An error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}); 