import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const APP_URL = Deno.env.get('APP_URL');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set');
    }

    const { email, vendorName, tempPassword } = await req.json();

    // Log the request data (without sensitive info)
    console.log('Sending email to:', email);
    console.log('SendGrid API Key length:', SENDGRID_API_KEY.length);

    const emailData = {
      personalizations: [{
        to: [{ email }]
      }],
      from: { email: "contact@cupshup.ai", name: "CupShup" },
      subject: 'Welcome to CupShup - Your Vendor Account Details',
      content: [{
        type: 'text/html',
        value: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Welcome to CupShup</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600px" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 20px;">
                    
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <img src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczOTc1NjQ5OSwiZXhwIjoxNzcxMjkyNDk5fQ.oTTH26i84ITLX_2p_wjPRtLjRdkThHPBbCRKigdde14" alt="CupShup Logo" width="150">
                      </td>
                    </tr>

                    <!-- Welcome Text -->
                    <tr>
                      <td align="center">
                        <h1 style="color: #00A979; font-size: 24px;">Welcome to CupShup! 🎉</h1>
                        <p style="color: #555; font-size: 16px;">Dear <strong>${vendorName}</strong>,</p>
                        <p style="color: #555; font-size: 16px;">We're excited to have you join our network of trusted vendors.</p>
                      </td>
                    </tr>

                    <!-- Credentials Section -->
                    <tr>
                      <td align="center" style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin: 20px;">
                        <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Your Login Credentials</h2>
                        <p style="font-size: 16px; color: #555;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #00A979; text-decoration: none;">${email}</a></p>
                        <p style="font-size: 16px; color: #555;"><strong>Password:</strong> ${tempPassword}</p>
                        <p style="font-size: 14px; color: #d9534f; margin-top: 10px;">For security reasons, please change your password upon first login.</p>
                      </td>
                    </tr>

                    <!-- Login Button -->
                    <tr>
                      <td align="center" style="padding: 20px;">
                        <a href="${APP_URL}/login" target="_blank" style="background-color: #00A979; color: white; text-decoration: none; font-size: 16px; padding: 12px 25px; border-radius: 5px; display: inline-block;">Login to Your Account</a>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding-top: 20px; font-size: 14px; color: #555;">
                        <p>Need help? Contact us at <a href="mailto:contact@cupshup.ai" style="color: #00A979; text-decoration: none;">contact@cupshup.ai</a></p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>

          </body>
          </html>
        `
      }]
    };

    // Log the request configuration
    console.log('Making request to SendGrid with config:', {
      url: 'https://api.sendgrid.com/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer [REDACTED]',
        'Content-Type': 'application/json'
      },
      bodyPreview: {
        from: emailData.from,
        to: emailData.personalizations[0].to,
        subject: emailData.subject
      }
    });

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    // Log the response details
    console.log('SendGrid Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
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