
export async function generateStoryWithOpenAI(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string,
  wordCount?: { min: number; max: number },
  temperature?: number
) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not available');
  }

  console.log('🤖 Generating story with OpenAI GPT-4o-mini...');

  const { min: minWords, max: maxWords } = wordCount || { min: 120, max: 200 };
  const temp = temperature || 0.7;

  // Build system prompt
  const systemPrompt = `You are a master storyteller AI. Generate immersive story segments in JSON format.

REQUIREMENTS:
- Generate ${minWords}-${maxWords} words for rich, detailed storytelling
- Create exactly 3 meaningful choices that advance the plot
- Include detailed image descriptions for visual consistency

Response format (EXACT JSON):
{
  "segmentText": "A ${minWords}-${maxWords} word story segment with vivid descriptions",
  "choices": ["Choice 1", "Choice 2", "Choice 3"],
  "isEnd": false,
  "imagePrompt": "Detailed scene description for image generation"
}`;

  const userPrompt = initialPrompt 
    ? `Start a new ${storyMode || 'fantasy'} story: "${initialPrompt}"`
    : `Continue the story. User chose: "${choiceText}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: temp,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('OpenAI returned empty response');
    }
    
    const parsedResponse = JSON.parse(responseText);
    
    // Basic validation
    if (!parsedResponse.segmentText || !parsedResponse.choices) {
      throw new Error('OpenAI response missing required fields');
    }
    
    console.log('✅ Story generation successful');
    return parsedResponse;
    
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    throw error;
  }
}
