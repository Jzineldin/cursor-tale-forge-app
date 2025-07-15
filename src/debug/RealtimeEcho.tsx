
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function RealtimeEcho(): null {
  useEffect(() => {
    const channel = supabase
      .channel('debug-echo')
      .on(
        'broadcast',
        { event: '*' },
        (payload: any) => console.log('[ECHO payload]', payload)
      )
      .subscribe((status: any) => console.log('[ECHO status]', status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // invisible component
}
