import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { extractTextFromImage, extractOrderId } from '../../lib/googleVision';
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  User,
  Phone,
  ShoppingBag,
  Camera,
  Upload,
  AlertCircle,
  Scan,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface TaskFormData {
  customer_name: string;
  customer_number: string;
  order_id: string;
  order_image: File | null;
}

export default function AddTask() {
  const { id: activityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<TaskFormData>({
    customer_name: '',
    customer_number: '',
    order_id: '',
    order_image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingOcr, setProcessingOcr] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setProcessingOcr(true);
      setFormData(prev => ({ ...prev, order_image: file }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Process OCR
      console.log('Starting OCR processing for file:', file.name);
      const extractedText = await extractTextFromImage(file);
      console.log('OCR completed, extracted text:', extractedText);
      
      const orderId = extractOrderId(extractedText);
      console.log('Extracted order ID:', orderId);
      
      if (orderId) {
        setFormData(prev => ({ ...prev, order_id: orderId }));
      } else {
        setError('No order ID found in the image. Please enter it manually.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      // Reset form data on error
      setFormData(prev => ({ ...prev, order_image: null }));
      setImagePreview(null);
    } finally {
      setProcessingOcr(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create a unique filename using timestamp and random string
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Create path: user_id/filename
      const filePath = `${user.id}/${fileName}`;

      console.log('Attempting to upload image to:', filePath);

      // Upload to task_images bucket
      const { error: uploadError, data } = await supabase.storage
        .from('task_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Explicitly set content type
        });

      if (uploadError) {
        console.error('Error uploading image:', {
          error: uploadError,
          path: filePath,
          fileType: file.type,
          fileSize: file.size
        });
        throw new Error(
          uploadError.message || 'Failed to upload image. Please try again.'
        );
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task_images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully, URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activityId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate phone number - ensure it's a valid number
      const phoneNumber = formData.customer_number.replace(/\D/g, '');
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      // Upload image if present
      let imageUrl = '';
      if (formData.order_image) {
        try {
          imageUrl = await uploadImage(formData.order_image);
        } catch (uploadError) {
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      // Prepare task data
      const taskData = {
        vendor_id: user.id,
        activity_id: activityId,
        customer_name: formData.customer_name.trim(),
        customer_number: Number(phoneNumber),
        order_id: formData.order_id || null,
        order_image_url: imageUrl // This will now be a valid public URL or empty string
      };

      // Debug log
      console.log('Attempting to create task with data:', {
        ...taskData,
        customer_number_length: phoneNumber.length,
        user_id_exists: !!user.id,
        activity_id_exists: !!activityId,
        has_image: !!imageUrl
      });

      // Insert task into database
      const { data: task, error: insertError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (insertError) {
        console.error('Detailed insert error:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Handle specific error cases
        if (insertError.code === '42501') {
          throw new Error('You do not have permission to create tasks for this activity');
        } else if (insertError.code === '23503') {
          throw new Error('Invalid activity or vendor ID. Please check if you are assigned to this activity.');
        } else if (insertError.code === '23514') {
          throw new Error('Invalid data format. Please check all fields and try again.');
        } else {
          throw new Error(`Failed to create task: ${insertError.message}`);
        }
      }

      console.log('Task created successfully:', task);

      // Show success message
      setSuccess(true);
      
      // Reset form after 2 seconds and navigate back
      setTimeout(() => {
        navigate(`/vendor/activities/${activityId}`);
      }, 2000);

    } catch (err) {
      console.error('Full error object:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to create task. Please check your input and try again.'
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/vendor/activities/${activityId}`)}
          className="text-gray-600 -ml-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#00A979]">Add New Task</h1>
          <p className="text-sm text-gray-600">Create a new task for this activity</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Task created successfully!</p>
            <p className="text-sm text-green-600">Redirecting to activity details...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Task Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A979]/20 focus:border-[#00A979]"
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label htmlFor="customer_number" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                id="customer_number"
                value={formData.customer_number}
                onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A979]/20 focus:border-[#00A979]"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* Order Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Image
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Upload className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Choose File or Take Photo"
                    value={formData.order_image ? formData.order_image.name : ''}
                    readOnly
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {/* File Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-4 border-gray-200"
                    title="Upload from gallery"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {/* Camera Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="camera-upload"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-4 border-gray-200"
                    title="Take photo"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {processingOcr && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing image...</span>
              </div>
            )}
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Order preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Order ID */}
          <div>
            <label htmlFor="order_id" className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="order_id"
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A979]/20 focus:border-[#00A979]"
                placeholder="Enter order ID (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00A979] text-white hover:bg-[#00A979]/90 h-10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 