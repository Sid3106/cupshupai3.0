// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const APP_URL = Deno.env.get('APP_URL');

console.log("Hello from Functions!")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set');
    }

    const { email, clientName } = await req.json();

    // Log the request data (without sensitive info)
    console.log('Sending welcome email to client:', email);
    console.log('SendGrid API Key length:', SENDGRID_API_KEY.length);

    const emailData = {
      personalizations: [{
        to: [{ email }]
      }],
      from: { email: "contact@cupshup.ai", name: "CupShup AI" },
      subject: 'Welcome to CupShup AI',
      content: [{
        type: 'text/html',
        value: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to CupShup AI</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 180px;
        }
        .content {
            text-align: center;
            color: #333;
        }
        .button {
            display: inline-block;
            background-color: #00A979;
            color: #ffffff;
            padding: 12px 20px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTc0MjAwMDE2NywiZXhwIjoxNzczNTM2MTY3fQ.kI8HZMCYwypVkipKMDQ6rMsomzdCZyf2fK0XLtbGNz4" alt="CupShup Logo">
        </div>
        <div class="content">
            <h2>Welcome to CupShup AI! 🎉</h2>
            <p>We're thrilled to have you onboard! With CupShup AI, you'll have a streamlined experience to manage your projects and stay on top of everything.</p>
            <p>Get started by exploring your dashboard and unlocking all the powerful features designed for you.</p>
            <a href="${APP_URL}/login?redirect=/client/dashboard" class="button">Access Your Dashboard</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Please sign in with your email and password to access your dashboard.
            </p>
        </div>
        <div class="footer">
            <p>Need help? Contact us anytime at <a href="mailto:support@cupshup.co.in">support@cupshup.co.in</a></p>
            <p>&copy; ${new Date().getFullYear()} CupShup AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SendGrid Error Details:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Full error details:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to send email',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-client-welcome' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
