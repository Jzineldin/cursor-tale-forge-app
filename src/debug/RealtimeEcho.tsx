
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureConsole } from '@/utils/secureLogger';

export default function RealtimeEcho(): null {
  useEffect(() => {
    const channel = supabase
      .channel('debug-echo')
      .on(
        'broadcast',
        { event: '*' },
        (payload: any) => secureConsole.debug('[ECHO payload]', payload)
      )
      .subscribe((status: any) => secureConsole.debug('[ECHO status]', status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // invisible component
}
