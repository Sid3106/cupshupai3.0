// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7?target=deno";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Hello from Functions!")

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

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface CreateClientRequest {
  email: string;
  name: string;
  brandName: BrandName;
  phone?: string;
  city?: string;
}

// Input validation function
function validateInput(input: any): { isValid: boolean; error?: string } {
  if (!input.email || typeof input.email !== 'string' || !input.email.includes('@')) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  if (!input.brandName || !VALID_BRAND_NAMES.includes(input.brandName)) {
    return { isValid: false, error: `Invalid brand name. Must be one of: ${VALID_BRAND_NAMES.join(', ')}` };
  }

  if (input.phone && !/^\d{10}$/.test(input.phone.replace(/\D/g, ''))) {
    return { isValid: false, error: 'Phone number must be 10 digits' };
  }

  return { isValid: true };
}

const updateTriggerFunction = async (supabase: SupabaseClient) => {
  const triggerFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $function$
    begin
      insert into public.profiles (user_id, role, name)
      values (
        NEW.id,
        COALESCE(NEW.user_metadata->>'role', 'CupShup'),
        COALESCE(NEW.user_metadata->>'name', split_part(NEW.email, '@', 1))
      );
      return new;
    end;
    $function$
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: triggerFunctionSQL });
  if (error) throw new Error(`Error updating handle_new_user function: ${error.message}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { email, name, brandName, phone, city } = await req.json() as CreateClientRequest;

    // Log request (without sensitive data)
    console.log('Client invite request received:', {
      timestamp: new Date().toISOString(),
      email: email.split('@')[0] + '@...',
      brandName,
      hasPhone: !!phone,
      hasCity: !!city
    });

    // Validate input
    const validation = validateInput({ email, name, brandName, phone, city });
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // Log environment setup
    console.log('Environment check:', {
      timestamp: new Date().toISOString(),
      hasUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });

    // Create new auth user with Client role and metadata
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "cupshup@1234",
      email_confirm: true,
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
        providers: ['email'],
        role: 'client'
      }
    });

    if (createUserError) {
      console.error('User creation error:', {
        timestamp: new Date().toISOString(),
        message: createUserError.message,
        details: JSON.stringify(createUserError),
        code: createUserError.code,
        hint: createUserError.hint,
        status: createUserError.status
      });
      throw new Error(`Failed to create user: ${createUserError.message}`);
    }

    if (!userData?.user?.id) {
      throw new Error("No user ID returned from createUser");
    }

    // Wait a moment for triggers to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify profile creation
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError) {
      console.error('Profile verification error:', {
        timestamp: new Date().toISOString(),
        userId: userData.user.id,
        error: profileError
      });
    } else {
      console.log('Profile created successfully:', {
        timestamp: new Date().toISOString(),
        userId: userData.user.id,
        profileId: profile.id
      });
    }

    // Verify client entry
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (clientError) {
      console.error('Client verification error:', {
        timestamp: new Date().toISOString(),
        userId: userData.user.id,
        error: clientError
      });
    } else {
      console.log('Client entry created successfully:', {
        timestamp: new Date().toISOString(),
        userId: userData.user.id,
        clientId: client.id
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        userId: userData.user.id,
        message: `Client ${name} invited successfully!`,
        details: {
          profile: profile ? 'created' : 'pending',
          client: client ? 'created' : 'pending'
        }
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      }
    );

  } catch (err) {
    console.error("Error in create-client-invite function:", {
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-client-invite' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
