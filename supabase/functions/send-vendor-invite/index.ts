import { serve } from 'https://deno.fresh.dev/std@v9.6.1/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const appUrl = Deno.env.get('APP_URL');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const resend = new Resend(resendApiKey);
    const { email, tempPassword } = await req.json();

    const response = await resend.emails.send({
      from: 'CupShup <noreply@cupshup.co.in>',
      to: email,
      subject: 'Welcome to CupShup - Your Vendor Account Details',
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to CupShup</title>
          </head>
          <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${appUrl}/logo.svg" alt="CupShup Logo" style="max-width: 150px; height: auto;">
            </div>

            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #00A979; margin-bottom: 20px; font-size: 24px;">Welcome to CupShup! 🎉</h1>
              
              <p style="margin-bottom: 20px;">
                We're excited to have you join our network of trusted vendors. Your account has been successfully created.
              </p>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Your Login Credentials</h2>
                <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
                <p style="margin-bottom: 10px;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p style="color: #dc3545; font-size: 14px; margin-top: 10px;">
                  ⚠️ For security reasons, please change your password upon first login.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/login" 
                   style="display: inline-block; background-color: #00A979; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Login to Your Account
                </a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Need Help?</h2>
                <p style="margin-bottom: 20px;">
                  Our support team is here to help you get started. Contact us at:
                  <br>
                  📧 <a href="mailto:support@cupshup.co.in" style="color: #00A979; text-decoration: none;">support@cupshup.co.in</a>
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>
                © ${new Date().getFullYear()} CupShup. All rights reserved.
                <br>
                This email was sent to ${email}. If you did not request this email, please contact support.
              </p>
            </div>
          </body>
        </html>
      `
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});