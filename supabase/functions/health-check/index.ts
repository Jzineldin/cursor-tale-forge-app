import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Health check started");
    
    // Test basic function execution
    const timestamp = new Date().toISOString();
    console.log(`Health check timestamp: ${timestamp}`);
    
    // Test database connectivity
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    console.log("Testing database connection...");
    const { error: dbError } = await supabaseAdmin
      .from('stories')
      .select('*', { count: 'exact', head: true });
      
    if (dbError) {
      console.error("Database connection failed:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    console.log("Database connection successful");
    
    // Test environment variables
    const envCheck = {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasOpenAIKey: !!Deno.env.get('OPENAI_API_KEY'),
      hasGoogleKey: !!Deno.env.get('GOOGLE_API_KEY'),
      hasReplicateKey: !!Deno.env.get('REPLICATE_API_KEY'),
    };
    
    console.log("Environment variables check:", envCheck);
    
    const response = {
      status: 'healthy',
      timestamp,
      database: 'connected',
      environment: envCheck,
      message: 'All systems operational'
    };
    
    console.log("Health check completed successfully:", response);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Health check failed:", error);
    
    const errorResponse = {
      status: 'unhealthy',
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
