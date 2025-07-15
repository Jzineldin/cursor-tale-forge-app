
import { generateStoryWithOpenAI } from "./openai-text-service.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function generateStoryContent(
  initialPrompt?: string, 
  choiceText?: string, 
  visualContext?: any, 
  narrativeContext?: any, 
  storyMode?: string,
  supabaseClient?: SupabaseClient
) {
  console.log('🚀 Starting story generation with OpenAI GPT-4o-mini');
  
  // Use simple default settings to avoid admin settings complexity
  const defaultTextSettings = {
    wordCount: { min: 120, max: 200 },
    temperature: 0.7
  };

  console.log('Using default generation settings for reliability');

  // Check for OpenAI API key
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('❌ OpenAI API key not found');
    throw new Error('OpenAI API key not configured. Please add your OpenAI API key to continue.');
  }

  // Generate story with OpenAI
  console.log('🎯 Using OpenAI GPT-4o-mini as primary provider');
  return await generateStoryWithOpenAI(
    initialPrompt, 
    choiceText, 
    visualContext, 
    narrativeContext, 
    storyMode,
    defaultTextSettings.wordCount,
    defaultTextSettings.temperature
  );
}
