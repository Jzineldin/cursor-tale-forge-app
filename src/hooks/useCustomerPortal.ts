import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const openCustomerPortal = async () => {
  const { data, error } = await supabase.functions.invoke('stripe-customer-portal');

  if (error) {
    throw new Error(error.message || 'Failed to open customer portal');
  }

  return data;
};

export const useCustomerPortal = () => {
  return useMutation({
    mutationFn: openCustomerPortal,
    onSuccess: (data) => {
      if (data?.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      console.error('Customer portal error:', error);
      toast.error(`Failed to open billing portal: ${error.message}`);
    },
  });
};