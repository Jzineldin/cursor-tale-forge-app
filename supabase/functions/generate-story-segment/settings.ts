
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface GenerationSettings {
  textProviders: {
    primary: string;
    fallback: string;
    wordCount: { min: number; max: number };
    geminiSettings: {
      model: string;
      temperature: number;
    };
    openaiSettings: {
      model: string;
      temperature: number;
    };
    ovhSettings: {
      model: string;
      temperature: number;
      max_tokens: number;
    };
  };
  imageProviders: {
    primary: string;
    fallback: string;
    huggingFaceSettings: {
      model: string;
      steps: number;
      guidance_scale: number;
      width: number;
      height: number;
    };
    stableDiffusionSettings: {
      steps: number;
      dimensions: string;
    };
    dalleSettings: {
      model: string;
      quality: string;
      size: string;
    };
    replicateSettings: {
      model: string;
      steps: number;
      aspect_ratio: string;
      output_format: string;
    };
    ovhSettings: {
      model: string;
      negative_prompt: string;
    };
  };
  ttsProviders: {
    primary: string;
    voice: string;
    speed: number;
  };
}

const defaultSettings: GenerationSettings = {
  textProviders: {
    primary: 'ovh',  // Changed default to OVH Qwen2.5
    fallback: 'openai',
    wordCount: { min: 120, max: 200 },
    geminiSettings: {
      model: 'gemini-1.5-flash-latest',
      temperature: 0.7,
    },
    openaiSettings: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
    },
    ovhSettings: {
      model: 'qwen2.5-coder-32b-instruct',
      temperature: 0.7,
      max_tokens: 1500,
    },
  },
  imageProviders: {
    primary: 'ovh',  // Changed default to OVH
    fallback: 'openai',  // Changed fallback to OpenAI
    huggingFaceSettings: {
      model: 'black-forest-labs/FLUX.1-schnell',
      steps: 4,
      guidance_scale: 0.0,
      width: 1024,
      height: 1024,
    },
    stableDiffusionSettings: {
      steps: 20,
      dimensions: '1024x1024',
    },
    dalleSettings: {
      model: 'dall-e-3',
      quality: 'standard',
      size: '1024x1024',
    },
    replicateSettings: {
      model: 'flux-schnell',
      steps: 4,
      aspect_ratio: '1:1',
      output_format: 'webp',
    },
    ovhSettings: {
      model: 'sdxl',
      negative_prompt: 'Ugly, blurry, low quality',
    },
  },
  ttsProviders: {
    primary: 'openai',
    voice: 'fable',
    speed: 1.0,
  },
};

export async function getGenerationSettings(supabaseClient: SupabaseClient): Promise<GenerationSettings> {
  try {
    console.log('🔧 Loading admin settings from database...');
    
    const { data, error } = await supabaseClient
      .from('admin_settings')
      .select('key, value')
      .in('key', ['text_providers', 'image_providers', 'tts_providers']);

    if (error) {
      console.log('❌ Admin settings query error:', error.message);
      console.log('📋 Using default settings with OVH as primary');
      return defaultSettings;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No admin settings found in database');
      console.log('📋 Using default settings with OVH as primary');
      return defaultSettings;
    }

    console.log('📊 Found admin settings:', data.map(d => ({ key: d.key, hasValue: !!d.value })));

    const settings = { ...defaultSettings };
    
    data.forEach(setting => {
      try {
        const parsedValue = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        
        if (setting.key === 'text_providers') {
          console.log('🔤 Loading text provider settings:', parsedValue);
          settings.textProviders = { ...settings.textProviders, ...parsedValue };
        } else if (setting.key === 'image_providers') {
          console.log('🎨 Loading image provider settings:', parsedValue);
          settings.imageProviders = { ...settings.imageProviders, ...parsedValue };
          
          // Log the final image provider configuration
          console.log(`🎯 Image Provider Configuration:
            Primary: ${settings.imageProviders.primary}
            Fallback: ${settings.imageProviders.fallback}
            OVH Settings: ${JSON.stringify(settings.imageProviders.ovhSettings)}`);
        } else if (setting.key === 'tts_providers') {
          console.log('🔊 Loading TTS provider settings:', parsedValue);
          settings.ttsProviders = { ...settings.ttsProviders, ...parsedValue };
        }
      } catch (parseError) {
        console.error(`❌ Failed to parse setting ${setting.key}:`, parseError);
        console.log(`📄 Raw value: ${setting.value}`);
      }
    });

    // Final verification log
    console.log(`✅ Final Settings Loaded:
      🎨 Image Primary: ${settings.imageProviders.primary}
      🔄 Image Fallback: ${settings.imageProviders.fallback}
      ⚙️ OVH Configured: ${settings.imageProviders.ovhSettings ? 'Yes' : 'No'}`);

    return settings;
  } catch (error) {
    console.error('💥 Critical error loading admin settings:', error);
    console.log('📋 Falling back to default settings with OVH as primary');
    return defaultSettings;
  }
}
