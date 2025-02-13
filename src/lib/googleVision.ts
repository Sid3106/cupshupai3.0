const GOOGLE_CLOUD_VISION_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Debug log to check if environment variable is loaded
console.log('API Key available:', !!GOOGLE_CLOUD_VISION_API_KEY);
console.log('API Key length:', GOOGLE_CLOUD_VISION_API_KEY?.length);

/**
 * Extract text from an image using Google Cloud Vision API
 * @param imageFile - The image file to process
 * @returns Promise<string> - The extracted text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile);
    
    if (!GOOGLE_CLOUD_VISION_API_KEY) {
      throw new Error('Google Cloud API Key is not configured');
    }

    // Prepare the request body
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1] // Remove the data URL prefix
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };

    // Log request details (without sensitive info)
    console.log('Request details:', {
      url: VISION_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      bodyPreview: {
        requests: [{
          features: requestBody.requests[0].features,
          imageSize: base64Image.length
        }]
      }
    });

    // Make the API request
    const response = await fetch(`${VISION_API_URL}?key=${GOOGLE_CLOUD_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Vision API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries([...response.headers.entries()])
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.responses?.[0]) {
      throw new Error('No response data from Vision API');
    }

    const text = data.responses[0]?.textAnnotations?.[0]?.description || '';
    console.log('Extracted text:', text);
    return text;
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw error;
  }
}

/**
 * Convert a file to base64 string
 * @param file - The file to convert
 * @returns Promise<string> - The base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Extract order ID from text using pattern matching
 * @param text - The text to process
 * @returns string - The extracted order ID or empty string if not found
 */
export function extractOrderId(text: string): string {
  if (!text) return '';
  
  console.log('Attempting to extract order ID from:', text);
  
  // Updated regex pattern to match order IDs starting with OD followed by numbers
  const orderIdPattern = /Order\s*Id\s*\n*([O][D]\d+)/i;
  const match = text.match(orderIdPattern);
  
  const result = match?.[1] || '';
  console.log('Extracted order ID:', result);
  
  return result;
} 