import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';

interface Vendor {
  id: string;
  user_id: string;
  vendor_name: string;
}

interface AssignVendorDialogProps {
  activityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssignVendorDialog({ activityId, open, onOpenChange }: AssignVendorDialogProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vendorId: '',
    message: '',
    target: '',
    incentive: ''
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('vendor_name');

        if (error) throw error;
        setVendors(data || []);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchVendors();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.vendorId) throw new Error('Please select a vendor');
      if (!formData.target) throw new Error('Please enter a target value');

      const { error: assignmentError } = await supabase
        .from('activity_assignments')
        .insert({
          activity_id: activityId,
          vendor_id: formData.vendorId,
          instructions: formData.message,
          target: parseInt(formData.target),
          incentive: formData.incentive ? parseInt(formData.incentive) : null
        });

      if (assignmentError) throw assignmentError;

      // Close dialog and reset form
      onOpenChange(false);
      setFormData({
        vendorId: '',
        message: '',
        target: '',
        incentive: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign vendor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
            Assign Vendor
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
                Select Vendor *
              </label>
              <select
                id="vendor"
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
                disabled={loading}
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.user_id}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message to Vendor
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Add any specific instructions or notes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                  Target *
                </label>
                <input
                  type="number"
                  id="target"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="incentive" className="block text-sm font-medium text-gray-700 mb-1">
                  Incentive
                </label>
                <input
                  type="number"
                  id="incentive"
                  value={formData.incentive}
                  onChange={(e) => setFormData({ ...formData, incentive: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}