
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function initializeSupabaseClients(req: Request) {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    );
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    console.log('Supabase clients initialized successfully');
    return { supabaseClient, supabaseAdmin };
  } catch (clientError) {
    console.error('Supabase client initialization failed:', clientError);
    throw new Error('Failed to initialize database connection');
  }
}

export async function getAuthenticatedUser(supabaseClient: any) {
  let user = null;
  try {
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (!authError && authUser) {
      user = authUser;
      console.log('Authenticated user:', user.id);
    } else {
      console.log('Anonymous user access');
    }
  } catch (authException) {
    console.log('Authentication failed, proceeding as anonymous user:', authException);
  }
  return user;
}
