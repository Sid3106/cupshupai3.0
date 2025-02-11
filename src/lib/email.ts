import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendVendorInvite(email: string, tempPassword: string) {
  try {
    console.log('Attempting to send email to:', email);
    console.log('Using Resend API key:', import.meta.env.VITE_RESEND_API_KEY?.slice(0, 8) + '...');
    
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
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${import.meta.env.VITE_APP_URL}/logo.svg" alt="CupShup Logo" style="max-width: 150px; height: auto;">
            </div>

            <!-- Main Content -->
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #00A979; margin-bottom: 20px; font-size: 24px;">Welcome to CupShup! 🎉</h1>
              
              <p style="margin-bottom: 20px;">
                We're excited to have you join our network of trusted vendors. Your account has been successfully created, and you're just a few steps away from accessing our vendor portal.
              </p>

              <!-- Login Credentials Section -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Your Login Credentials</h2>
                <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
                <p style="margin-bottom: 10px;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p style="color: #dc3545; font-size: 14px; margin-top: 10px;">
                  ⚠️ For security reasons, please change your password upon first login.
                </p>
              </div>

              <!-- Getting Started Section -->
              <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Getting Started</h2>
              <ol style="margin-bottom: 25px; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Log in to your account using the button below</li>
                <li style="margin-bottom: 10px;">Change your temporary password</li>
                <li style="margin-bottom: 10px;">Complete your vendor profile</li>
                <li style="margin-bottom: 10px;">Review available activities</li>
              </ol>

              <!-- Key Features Section -->
              <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Key Features</h2>
              <ul style="list-style: none; padding: 0; margin-bottom: 25px;">
                <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                  ✓ <span style="margin-left: 5px;">Real-time activity notifications</span>
                </li>
                <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                  ✓ <span style="margin-left: 5px;">Easy task management</span>
                </li>
                <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                  ✓ <span style="margin-left: 5px;">Direct communication with clients</span>
                </li>
                <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                  ✓ <span style="margin-left: 5px;">Secure payment processing</span>
                </li>
              </ul>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${import.meta.env.VITE_APP_URL}/login" 
                   style="display: inline-block; background-color: #00A979; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Login to Your Account
                </a>
              </div>

              <!-- Support Section -->
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Need Help?</h2>
                <p style="margin-bottom: 20px;">
                  Our support team is here to help you get started. Contact us at:
                  <br>
                  📧 <a href="mailto:support@cupshup.co.in" style="color: #00A979; text-decoration: none;">support@cupshup.co.in</a>
                  <br>
                  📞 <a href="tel:+919876543210" style="color: #00A979; text-decoration: none;">+91 98765 43210</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>
                © ${new Date().getFullYear()} CupShup. All rights reserved.
                <br>
                123 Business Street, Mumbai, Maharashtra, India
              </p>
              <p style="margin-top: 10px;">
                This email was sent to ${email}. If you did not request this email, please contact support.
              </p>
            </div>
          </body>
        </html>
      `
    });
    
    console.log('Email send response:', response);
    return { success: true, response };
  } catch (error) {
    // Log the full error details
    console.error('Failed to send vendor invite email:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    return { success: false, error };
  }
}