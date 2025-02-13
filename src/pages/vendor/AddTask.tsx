import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  User,
  Phone,
  ShoppingBag,
  Camera,
  Upload,
  AlertCircle
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, order_image: file });
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('order-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('order-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activityId) return;

    setLoading(true);
    setError(null);

    try {
      // Validate phone number
      const phoneNumber = parseInt(formData.customer_number);
      if (isNaN(phoneNumber)) {
        throw new Error('Please enter a valid phone number');
      }

      // Upload image if present
      let imageUrl = '';
      if (formData.order_image) {
        imageUrl = await uploadImage(formData.order_image);
      }

      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          activity_id: activityId,
          vendor_id: user.id,
          customer_name: formData.customer_name,
          customer_number: phoneNumber,
          order_id: formData.order_id || null,
          order_image_url: imageUrl
        });

      if (insertError) throw insertError;

      // Navigate back to activity detail
      navigate(`/vendor/activities/${activityId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/vendor/activities/${activityId}`)}
          className="text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Task</h1>
          <p className="text-sm text-gray-600">Create a new task for this activity</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Task Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Name */}
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                id="customer_number"
                value={formData.customer_number}
                onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <div className="space-y-4">
              {/* File Upload Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    capture="environment"
                  />
                  <div className="w-full h-12 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
                    <Upload className="w-5 h-5" />
                    <span>Choose File</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    capture="environment"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-4"
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Order preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFormData({ ...formData, order_image: null });
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label htmlFor="order_id" className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <div className="relative">
              <ShoppingBag className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="order_id"
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter order ID (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90 h-12"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
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