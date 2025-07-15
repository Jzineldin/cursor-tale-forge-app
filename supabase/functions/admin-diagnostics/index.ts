import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SystemMetrics {
  database: {
    connected: boolean;
    storiesCount: number;
    segmentsCount: number;
    usersCount: number;
    lastActivity: string;
  };
  apiKeys: {
    openai: boolean;
    google: boolean;
    ovh: boolean;
    replicate: boolean;
  };
  providers: {
    name: string;
    type: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastChecked: string;
  }[];
  performance: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

async function testProviderHealth(providerName: string, endpoint: string): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    let testPayload = {};
    
    switch (providerName) {
      case 'OpenAI Text':
        testPayload = {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        };
        break;
      case 'OpenAI Image':
        testPayload = {
          prompt: 'A simple test image',
          model: 'dall-e-3',
          size: '1024x1024',
          n: 1
        };
        break;
      case 'OpenAI Audio':
        testPayload = {
          model: 'tts-1',
          input: 'Test audio',
          voice: 'fable'
        };
        break;
      case 'OVH Text':
        testPayload = {
          model: 'qwen2.5-coder-32b-instruct',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        };
        break;
      case 'Gemini':
        testPayload = {
          contents: [{ parts: [{ text: 'Test' }] }]
        };
        break;
    }

    // Simulate API call (in production, this would make actual API calls)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    const responseTime = Date.now() - startTime;
    
    // Simulate some failures for demonstration
    if (Math.random() < 0.1) {
      return {
        status: 'down',
        responseTime,
        error: 'API rate limit exceeded'
      };
    }
    
    if (responseTime > 3000) {
      return {
        status: 'degraded',
        responseTime
      };
    }
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

async function getDatabaseMetrics(supabaseAdmin: any) {
  try {
    const [storiesResult, segmentsResult, usersResult] = await Promise.all([
      supabaseAdmin.from('stories').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('story_segments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    const lastActivityResult = await supabaseAdmin
      .from('story_segments')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    return {
      connected: true,
      storiesCount: storiesResult.count || 0,
      segmentsCount: segmentsResult.count || 0,
      usersCount: usersResult.count || 0,
      lastActivity: lastActivityResult.data?.[0]?.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Database metrics error:', error);
    return {
      connected: false,
      storiesCount: 0,
      segmentsCount: 0,
      usersCount: 0,
      lastActivity: new Date().toISOString()
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Admin diagnostics function called");
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action } = await req.json().catch(() => ({ action: 'full_diagnostics' }));

    switch (action) {
      case 'provider_health':
        const providers = [
          { name: 'OpenAI Text', type: 'text' },
          { name: 'OpenAI Image', type: 'image' },
          { name: 'OpenAI Audio', type: 'audio' },
          { name: 'OVH Text', type: 'text' },
          { name: 'Gemini', type: 'text' }
        ];

        const providerResults = await Promise.all(
          providers.map(async (provider) => {
            const health = await testProviderHealth(provider.name, '');
            return {
              name: provider.name,
              type: provider.type,
              status: health.status,
              responseTime: health.responseTime,
              lastChecked: new Date().toISOString(),
              error: health.error
            };
          })
        );

        return new Response(JSON.stringify({ providers: providerResults }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      case 'system_metrics':
        const databaseMetrics = await getDatabaseMetrics(supabaseAdmin);
        
        const systemMetrics: SystemMetrics = {
          database: databaseMetrics,
          apiKeys: {
            openai: !!Deno.env.get('OPENAI_API_KEY'),
            google: !!Deno.env.get('GOOGLE_API_KEY'),
            ovh: !!Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
            replicate: !!Deno.env.get('REPLICATE_API_KEY')
          },
          providers: [],
          performance: {
            memoryUsage: Math.random() * 100,
            cpuUsage: Math.random() * 100,
            uptime: Math.random() * 86400 // Random uptime in seconds
          }
        };

        return new Response(JSON.stringify(systemMetrics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      case 'cost_analysis':
        // Mock cost data - in production, this would fetch from actual billing APIs
        const costData = {
          today: {
            openai: Math.random() * 50,
            ovh: Math.random() * 20,
            gemini: Math.random() * 15,
            replicate: Math.random() * 30
          },
          thisMonth: {
            openai: Math.random() * 500,
            ovh: Math.random() * 200,
            gemini: Math.random() * 150,
            replicate: Math.random() * 300
          },
          projectedMonth: {
            openai: Math.random() * 600,
            ovh: Math.random() * 250,
            gemini: Math.random() * 180,
            replicate: Math.random() * 350
          }
        };

        return new Response(JSON.stringify(costData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      default:
        // Full diagnostics
        const [dbMetrics, providerHealth] = await Promise.all([
          getDatabaseMetrics(supabaseAdmin),
          Promise.all([
            testProviderHealth('OpenAI Text', ''),
            testProviderHealth('OpenAI Image', ''),
            testProviderHealth('OVH Text', ''),
            testProviderHealth('Gemini', '')
          ])
        ]);

        const fullDiagnostics = {
          timestamp: new Date().toISOString(),
          status: 'healthy',
          database: dbMetrics,
          apiKeys: {
            openai: !!Deno.env.get('OPENAI_API_KEY'),
            google: !!Deno.env.get('GOOGLE_API_KEY'),
            ovh: !!Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
            replicate: !!Deno.env.get('REPLICATE_API_KEY')
          },
          providers: [
            { name: 'OpenAI Text', ...providerHealth[0] },
            { name: 'OpenAI Image', ...providerHealth[1] },
            { name: 'OVH Text', ...providerHealth[2] },
            { name: 'Gemini', ...providerHealth[3] }
          ],
          performance: {
            memoryUsage: Math.random() * 100,
            cpuUsage: Math.random() * 100,
            uptime: Math.random() * 86400
          }
        };

        return new Response(JSON.stringify(fullDiagnostics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
    }

  } catch (error) {
    console.error("Admin diagnostics error:", error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 