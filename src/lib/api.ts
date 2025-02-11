const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface InviteVendorResponse {
  success: boolean;
  error?: string;
  userId?: string;
  message?: string;
}

export async function inviteVendor({
  vendorName,
  email,
  phone,
  city
}: {
  vendorName: string;
  email: string;
  phone: string;
  city: string;
}): Promise<InviteVendorResponse> {
  try {
    // Construct the correct Edge Function URL
    const functionUrl = `${SUPABASE_URL}/functions/v1/invite-vendor`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        vendorName,
        email,
        phone,
        city
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      // Handle application-level errors
      throw new Error(data.error || 'Failed to invite vendor');
    }

    return data;
  } catch (err) {
    // Ensure we always return a properly structured error response
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred'
    };
  }
}