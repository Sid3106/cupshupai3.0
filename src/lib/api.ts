const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface InviteVendorResponse {
  success: boolean;
  error?: string;
  userId?: string;
  message?: string;
  emailError?: string;
}

interface InviteVendorParams {
  vendorName: string;
  email: string;
  phone: string;
  city: string;
}

export async function inviteVendor(params: InviteVendorParams): Promise<InviteVendorResponse> {
  try {
    // Only create the vendor, no email sending here
    const createVendorResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/invite-vendor`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(params),
      }
    );

    const vendorData = await createVendorResponse.json();
    
    if (!createVendorResponse.ok) {
      throw new Error(vendorData.error || 'Failed to create vendor');
    }

    return {
      success: true,
      userId: vendorData.userId,
      message: 'Vendor created successfully'
    };

  } catch (error) {
    console.error('Error in inviteVendor:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function sendVendorInviteEmail(email: string, vendorName: string) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-vendor-invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email,
          vendorName,
          tempPassword: 'cupshup@1234'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send invite email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending vendor invite email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invite email'
    };
  }
}

export async function sendActivityAssignmentEmail(params: {
  vendorName: string;
  vendorEmail: string;
  brand: string;
  city: string;
  location: string;
  startDate: string;
  endDate: string;
  instructions: string;
  target: number;
  incentive?: number;
}) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/assign-activity-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(params)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send assignment email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending activity assignment email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send assignment email'
    };
  }
}