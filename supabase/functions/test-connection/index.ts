
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Test connection function called");
    console.log("Method:", req.method);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    const requestBody = req.method === 'POST' ? await req.json() : null;
    console.log("Request body:", requestBody);
    
    const response = {
      status: 'success',
      message: 'Test connection successful',
      timestamp: new Date().toISOString(),
      method: req.method,
      hasBody: !!requestBody,
      bodyData: requestBody
    };
    
    console.log("Sending response:", response);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Test connection failed:", error);
    
    const errorResponse = {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
