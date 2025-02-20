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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set');
    }

    const { 
      vendorName,
      vendorEmail,
      brand,
      city,
      location,
      startDate,
      endDate,
      instructions,
      target,
      incentive
    } = await req.json();

    // Format dates for better readability
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };

    const emailData = {
      personalizations: [{
        to: [{ email: vendorEmail }]
      }],
      from: { email: "contact@cupshup.ai", name: "CupShup" },
      subject: `New Activity Assigned - ${brand}`,
      content: [{
        type: 'text/html',
        value: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>New Activity Assigned</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 20px;">
              <table align="center" width="100%" style="max-width: 600px; background: white; border-radius: 8px; padding: 20px;">
                  <!-- Logo -->
                  <tr>
                      <td align="center">
                          <img src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/public/cupshup/CupShupLogo.png" 
                               alt="CupShup Logo" width="120" style="margin-bottom: 20px;">
                      </td>
                  </tr>

                  <!-- Greeting & Message -->
                  <tr>
                      <td align="center">
                          <h2 style="color: #00A979; margin-bottom: 10px;">New Activity Alert, ${vendorName}! 🎉</h2>
                          <p style="color: #333; font-size: 16px;">
                              Hey ${vendorName}, you've got something new to do! 
                              The CupShup team has assigned you a fresh activity. Ready to dive in?
                          </p>
                          <p style="color: #555; font-size: 14px;">
                              Click the button below to view your assigned activity and get started!
                          </p>

                          <!-- Call-to-Action Button -->
                          <a href="${APP_URL}/vendor/my-activities" 
                             style="background-color: #00A979; color: white; padding: 12px 24px; text-decoration: none; 
                                    border-radius: 6px; display: inline-block; margin-top: 10px; font-size: 16px;">
                              Check Your Activity
                          </a>
                      </td>
                  </tr>

                  <!-- Activity Details -->
                  <tr>
                      <td style="padding: 20px; background: #f2f2f2; border-radius: 6px; margin: 20px 0;">
                          <h3 style="color: #00A979; text-align: center;">📌 Activity Details</h3>
                          <p><strong>Brand:</strong> ${brand}</p>
                          <p><strong>Location:</strong> ${city} - ${location}</p>
                          <p><strong>Start Time:</strong> ${formatDate(startDate)}</p>
                          <p><strong>End Time:</strong> ${formatDate(endDate)}</p>
                          <p><strong>Target:</strong> ${target} tasks</p>
                          ${incentive ? `<p><strong>Incentive:</strong> ₹${incentive}</p>` : ''}
                          <p><strong>Instructions:</strong> ${instructions}</p>
                      </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                      <td align="center" style="padding: 20px;">
                          <p style="color: #888; font-size: 12px;">
                              Need help? Contact us at 
                              <a href="mailto:contact@cupshup.ai" style="color: #00A979; text-decoration: none;">
                                  contact@cupshup.ai
                              </a>
                          </p>
                          <p style="color: #888; font-size: 12px;">© 2024 CupShup AI. All rights reserved.</p>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
        `
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
    console.error('Error sending activity assignment email:', error);
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/assign-activity-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
