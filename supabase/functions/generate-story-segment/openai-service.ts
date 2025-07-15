
export async function generateWithOpenAI(
  initialPrompt?: string, 
  choiceText?: string, 
  visualContext?: any, 
  narrativeContext?: any, 
  storyMode?: string,
  wordCount?: { min: number; max: number },
  temperature?: number,
  model?: string
) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not available');
  }

  console.log('Generating with OpenAI as fallback...');

  const { min: minWords, max: maxWords } = wordCount || { min: 120, max: 200 };
  const selectedModel = model || 'gpt-4o-mini';
  const temp = temperature || 0.7;

  const systemPrompt = `You are a storytelling AI. Generate a story segment with choices in JSON format.
    
    **IMPORTANT WORD COUNT**: Generate story segments between ${minWords} and ${maxWords} words to create rich, immersive storytelling experiences. This is longer than typical micro-fiction to allow for proper character development, scene setting, and atmospheric details.
    
    Respond with this exact JSON structure:
    {
      "segmentText": "A ${minWords}-${maxWords} word story segment with rich descriptions and atmospheric details",
      "choices": ["Choice 1", "Choice 2", "Choice 3"],
      "isEnd": false,
      "imagePrompt": "Detailed image description",
      "visualContext": {"style": "art style", "characters": {}},
      "narrativeContext": {"summary": "story summary", "currentObjective": "goal", "arcStage": "setup"}
    }`;

  const userPrompt = initialPrompt 
    ? `Start a new ${storyMode || ''} story: "${initialPrompt}"`
    : `Continue the story. User chose: "${choiceText}"`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: temp,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed with status ${response.status}`);
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content;
  
  return JSON.parse(responseText);
}
