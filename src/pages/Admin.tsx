
import React, { useState } from 'react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminOverview from '@/components/admin/AdminOverview';
import TextProviderSettings from '@/components/admin/TextProviderSettings';
import ImageProviderSettings from '@/components/admin/ImageProviderSettings';
import TTSProviderSettings from '@/components/admin/TTSProviderSettings';
import AdminWaitlistViewer from '@/components/admin/AdminWaitlistViewer';
import SystemLogsViewer from '@/components/admin/SystemLogsViewer';
import APIMonitoringDashboard from '@/components/admin/APIMonitoringDashboard';
import ModelManagementSystem from '@/components/admin/ModelManagementSystem';
import CostTracker from '@/components/admin/CostTracker';
import SystemDiagnostics from '@/components/SystemDiagnostics';

import { ElevenLabsVoicesExplorer } from '@/components/admin/ElevenLabsVoicesExplorer';
import AudioGenerationManager from '@/components/admin/AudioGenerationManager';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Activity, Settings, FileText, BarChart3, Zap, DollarSign, Volume2, Database, RefreshCw, AlertTriangle, Users } from 'lucide-react';
import { usePublicStoriesMigration } from '@/utils/migratePublicStories';

const Admin: React.FC = () => {
  const { hasAccess, loading: accessLoading } = useAdminAccess();
  const { settings, setSettings, loading } = useAdminSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const { runMigration } = usePublicStoriesMigration();
  const [isMigrating, setIsMigrating] = useState(false);

  const updateTextProviders = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      textProviders: {
        ...prev.textProviders,
        [field]: value
      }
    }));
  };

  const updateImageProviders = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      imageProviders: {
        ...prev.imageProviders,
        [field]: value
      }
    }));
  };

  const updateTTSProviders = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      ttsProviders: {
        ...prev.ttsProviders,
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      const updates = [
        {
          key: 'text_providers',
          value: JSON.stringify(settings.textProviders),
        },
        {
          key: 'image_providers',
          value: JSON.stringify(settings.imageProviders),
        },
        {
          key: 'tts_providers',
          value: JSON.stringify(settings.ttsProviders),
        },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    try {
      await runMigration();
    } finally {
      setIsMigrating(false);
    }
  };

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-purple-200">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-11 bg-slate-800 border-purple-600">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="models" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger 
              value="costs" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="voices" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Volume2 className="h-4 w-4" />
              Voices
            </TabsTrigger>
            <TabsTrigger 
              value="audio" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <AlertTriangle className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger 
              value="waitlist" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Waitlist
            </TabsTrigger>
            <TabsTrigger 
              value="migration" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Database className="h-4 w-4" />
              Migration
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="diagnostics" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <AlertTriangle className="h-4 w-4" />
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <APIMonitoringDashboard />
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <ModelManagementSystem />
          </TabsContent>

          <TabsContent value="costs" className="mt-6">
            <CostTracker />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <SystemLogsViewer />
          </TabsContent>

          <TabsContent value="voices" className="mt-6">
            <ElevenLabsVoicesExplorer />
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            <AudioGenerationManager />
          </TabsContent>

          <TabsContent value="waitlist" className="mt-6">
            <AdminWaitlistViewer />
          </TabsContent>

          <TabsContent value="migration" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-purple-600/50">
                <CardHeader>
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Public Stories Migration
                  </CardTitle>
                  <CardDescription className="text-purple-300">
                    Migrate existing public stories to ensure they're properly set up for the Discover page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      This migration will:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                      <li>Find all stories marked as public</li>
                      <li>Ensure they have proper published_at dates</li>
                      <li>Update any missing story_mode metadata</li>
                      <li>Make them visible in the Discover page</li>
                    </ul>
                    <Button 
                      onClick={handleRunMigration}
                      disabled={isMigrating}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isMigrating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Running Migration...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Run Public Stories Migration
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="space-y-8">
              <TextProviderSettings 
                settings={settings.textProviders}
                onUpdate={updateTextProviders}
              />
              
              <ImageProviderSettings 
                settings={settings.imageProviders}
                onUpdate={updateImageProviders}
              />
              
              <TTSProviderSettings 
                settings={settings.ttsProviders}
                onUpdate={updateTTSProviders}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={saveSettings}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-6 mt-6">
            <SystemDiagnostics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
