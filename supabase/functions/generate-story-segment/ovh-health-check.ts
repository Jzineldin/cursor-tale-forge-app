/**
 * OVH AI Service Health Check Utility
 * 
 * Provides basic connectivity and authentication testing for OVH AI endpoints
 */

export async function checkOVHHealth(): Promise<{
  isHealthy: boolean;
  error?: string;
  details: {
    tokenAvailable: boolean;
    endpointReachable: boolean;
    authenticationValid: boolean;
    responseTime?: number;
  };
}> {
  const OVH_API_TOKEN = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
  
  const result = {
    isHealthy: false,
    details: {
      tokenAvailable: !!OVH_API_TOKEN,
      endpointReachable: false,
      authenticationValid: false,
    }
  };
  
  if (!OVH_API_TOKEN) {
    return {
      ...result,
      error: 'OVH_AI_ENDPOINTS_ACCESS_TOKEN not configured'
    };
  }
  
  try {
    const startTime = Date.now();
    
    // Test basic connectivity with a minimal request using OpenAI-compatible endpoint
    const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OVH_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen2.5-Coder-32B-Instruct',
        messages: [
          { role: 'user', content: 'Test connectivity' }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });
    
    const responseTime = Date.now() - startTime;
    result.details.responseTime = responseTime;
    result.details.endpointReachable = true;
    
    if (response.status === 401) {
      result.details.authenticationValid = false;
      return {
        ...result,
        error: 'OVH API authentication failed - invalid OVH_AI_ENDPOINTS_ACCESS_TOKEN'
      };
    }
    
    if (response.status === 429) {
      result.details.authenticationValid = true;
      return {
        ...result,
        error: 'OVH API rate limit exceeded'
      };
    }
    
    if (response.ok) {
      result.details.authenticationValid = true;
      result.isHealthy = true;
      return result;
    }
    
    // Other HTTP errors
    const errorText = await response.text();
    return {
      ...result,
      error: `OVH API error: ${response.status} - ${errorText}`
    };
    
  } catch (error) {
    return {
      ...result,
      error: `Network error: ${error.message}`
    };
  }
}
