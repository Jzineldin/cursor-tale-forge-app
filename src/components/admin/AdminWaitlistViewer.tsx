import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  marketing_consent: boolean;
  created_at: string;
}

const AdminWaitlistViewer: React.FC = () => {
  const { data: waitlistEntries, isLoading, error } = useQuery({
    queryKey: ['waitlist-entries'],
    queryFn: async () => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WaitlistEntry[];
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return (
      <Card className="bg-slate-800 border-red-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Management - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">Failed to load waitlist entries: {errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Waitlist Management
        </CardTitle>
        <CardDescription className="text-purple-200">
          {waitlistEntries?.length || 0} people have joined the waitlist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {waitlistEntries && waitlistEntries.length > 0 ? (
          waitlistEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-white font-medium">{entry.name}</h3>
                  <div className="flex items-center gap-2 text-purple-200 text-sm">
                    <Mail className="h-4 w-4" />
                    {entry.email}
                  </div>
                  <div className="flex items-center gap-2 text-purple-200 text-sm mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entry.marketing_consent && (
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Marketing OK
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-purple-200">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No waitlist entries yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminWaitlistViewer;
