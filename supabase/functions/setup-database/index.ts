import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Setting up complete database schema...')

    // 1. Create the main stories table with all required fields
    const { error: storiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.stories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT,
          description TEXT,
          genre TEXT,
          story_mode TEXT,
          is_complete BOOLEAN DEFAULT false,
          is_completed BOOLEAN DEFAULT false,
          is_public BOOLEAN DEFAULT false,
          published_at TIMESTAMPTZ,
          segment_count INTEGER DEFAULT 0,
          thumbnail_url TEXT,
          audio_generation_status TEXT DEFAULT 'not_started',
          full_story_audio_url TEXT,
          audio_duration REAL,
          animated_video_url TEXT,
          animated_video_status TEXT NOT NULL DEFAULT 'not_started',
          word_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    })

    if (storiesError) {
      console.error('Error creating stories table:', storiesError)
    }

    // 2. Create the story_segments table with all required fields
    const { error: segmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.story_segments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
          parent_segment_id UUID REFERENCES public.story_segments(id) ON DELETE SET NULL,
          segment_number INTEGER,
          triggering_choice_text TEXT,
          segment_text TEXT NOT NULL,
          image_url TEXT,
          audio_url TEXT,
          choices TEXT[],
          is_end BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    })

    if (segmentsError) {
      console.error('Error creating story_segments table:', segmentsError)
    }

    // 3. Create the profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT,
          full_name TEXT,
          display_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    })

    if (profilesError) {
      console.error('Error creating profiles table:', profilesError)
    }

    // 4. Create the user_roles table
    const { error: userRolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id, role)
        );
      `
    })

    if (userRolesError) {
      console.error('Error creating user_roles table:', userRolesError)
    }

    // 5. Create the admin_settings table
    const { error: adminSettingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.admin_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    })

    if (adminSettingsError) {
      console.error('Error creating admin_settings table:', adminSettingsError)
    }

    // 6. Create the waitlist table
    const { error: waitlistError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.waitlist (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    })

    if (waitlistError) {
      console.error('Error creating waitlist table:', waitlistError)
    }

    // 7. Create the waitlist_entries table
    const { error: waitlistEntriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.waitlist_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    })

    if (waitlistEntriesError) {
      console.error('Error creating waitlist_entries table:', waitlistEntriesError)
    }

    // 8. Create storage buckets
    const { error: bucketsError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO storage.buckets (id, name, public)
        VALUES 
          ('story_images', 'story_images', true),
          ('story-audio', 'story-audio', true),
          ('full-story-audio', 'full-story-audio', true)
        ON CONFLICT (id) DO NOTHING;
      `
    })

    if (bucketsError) {
      console.error('Error creating storage buckets:', bucketsError)
    }

    // 9. Create storage policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow public reads on story_images"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'story_images' );

        CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to story_images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'story_images' );

        CREATE POLICY IF NOT EXISTS "Allow public reads on story_audio"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'story-audio' );

        CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to story_audio"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'story-audio' );

        CREATE POLICY IF NOT EXISTS "Allow public reads on full_story_audio"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'full-story-audio' );

        CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to full_story_audio"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'full-story-audio' );
      `
    })

    if (policiesError) {
      console.error('Error creating storage policies:', policiesError)
    }

    // 10. Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
    }

    // 11. Create RLS policies for stories
    const { error: storiesPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow public read access to stories"
        ON public.stories FOR SELECT USING (is_public = true);

        CREATE POLICY IF NOT EXISTS "Allow individual read access to own stories"
        ON public.stories FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Allow anonymous story creation"
        ON public.stories FOR INSERT WITH CHECK (user_id IS NULL);

        CREATE POLICY IF NOT EXISTS "Allow anonymous story reading"
        ON public.stories FOR SELECT USING (user_id IS NULL);

        CREATE POLICY IF NOT EXISTS "Allow authenticated users to create stories"
        ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Allow users to update their own stories"
        ON public.stories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Allow users to delete their own stories"
        ON public.stories FOR DELETE USING (auth.uid() = user_id);
      `
    })

    if (storiesPoliciesError) {
      console.error('Error creating stories RLS policies:', storiesPoliciesError)
    }

    // 12. Create RLS policies for story_segments
    const { error: segmentsPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow public read access to story segments"
        ON public.story_segments FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = story_segments.story_id AND stories.is_public = true
          )
        );

        CREATE POLICY IF NOT EXISTS "Allow individual read access to own story segments"
        ON public.story_segments FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = story_segments.story_id AND stories.user_id = auth.uid()
          )
        );

        CREATE POLICY IF NOT EXISTS "Allow anonymous segment creation"
        ON public.story_segments FOR INSERT WITH CHECK (
            (SELECT user_id FROM public.stories WHERE id = story_id) IS NULL
        );

        CREATE POLICY IF NOT EXISTS "Allow anonymous segment reading"
        ON public.story_segments FOR SELECT USING (
            (SELECT user_id FROM public.stories WHERE id = story_id) IS NULL
        );

        CREATE POLICY IF NOT EXISTS "Allow users to insert segments for their own stories"
        ON public.story_segments FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = story_segments.story_id AND stories.user_id = auth.uid()
          )
        );
      `
    })

    if (segmentsPoliciesError) {
      console.error('Error creating story_segments RLS policies:', segmentsPoliciesError)
    }

    // 13. Create RLS policies for profiles
    const { error: profilesPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" 
        ON public.profiles FOR SELECT USING (true);

        CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
        ON public.profiles FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
        ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
      `
    })

    if (profilesPoliciesError) {
      console.error('Error creating profiles RLS policies:', profilesPoliciesError)
    }

    // 14. Create RLS policies for admin_settings
    const { error: adminPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow authenticated read access to admin settings"
        ON public.admin_settings FOR SELECT TO authenticated USING (true);
      `
    })

    if (adminPoliciesError) {
      console.error('Error creating admin_settings RLS policies:', adminPoliciesError)
    }

    // 15. Create RLS policies for waitlist
    const { error: waitlistPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow public waitlist signup"
        ON public.waitlist_entries FOR INSERT WITH CHECK (true);
      `
    })

    if (waitlistPoliciesError) {
      console.error('Error creating waitlist RLS policies:', waitlistPoliciesError)
    }

    // 16. Create indexes
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
        CREATE INDEX IF NOT EXISTS idx_stories_is_public ON public.stories(is_public);
        CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_story_segments_story_id ON public.story_segments(story_id);
        CREATE INDEX IF NOT EXISTS idx_story_segments_parent_id ON public.story_segments(parent_segment_id);
        CREATE INDEX IF NOT EXISTS idx_story_segments_created_at ON public.story_segments(created_at);
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
        CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist_entries(email);
      `
    })

    if (indexesError) {
      console.error('Error creating indexes:', indexesError)
    }

    // 17. Create has_role function for admin access
    const { error: hasRoleFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = _user_id AND role = _role
          );
        END;
        $$;
      `
    })

    if (hasRoleFunctionError) {
      console.error('Error creating has_role function:', hasRoleFunctionError)
    }

    // 18. Create function to handle user creation
    const { error: handleUserFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, full_name)
          VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
          ON CONFLICT (id) DO NOTHING;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })

    if (handleUserFunctionError) {
      console.error('Error creating handle_new_user function:', handleUserFunctionError)
    }

    // 19. Create trigger for new user creation
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    })

    if (triggerError) {
      console.error('Error creating trigger:', triggerError)
    }

    // 20. Insert admin role for your email
    const { error: adminRoleError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.user_roles (user_id, role)
        SELECT 
            u.id,
            'admin'
        FROM auth.users u
        WHERE u.email IN ('jzineldin+admin@gmail.com', 'jzineldin@gmail.com')
        ON CONFLICT (user_id, role) DO NOTHING;
      `
    })

    if (adminRoleError) {
      console.error('Error inserting admin role:', adminRoleError)
    }

    console.log('Complete database setup finished')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Complete database schema setup finished'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Database setup failed:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 