import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { genre } = await req.json()

    if (!genre) {
      return new Response(
        JSON.stringify({ error: 'Genre is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate AI prompts based on genre
    const prompts = await generateGenrePrompts(genre)

    return new Response(
      JSON.stringify({ prompts }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating inspiration prompts:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate prompts' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateGenrePrompts(genre: string): Promise<string[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not available')
  }

  const genreInstructions = getGenreInstructions(genre)
  
  const systemPrompt = `You are an expert children's storyteller creating engaging, age-appropriate story prompts for children ages 4-12.

${genreInstructions}

CRITICAL REQUIREMENTS:
- Generate exactly 3 unique, creative story prompts
- Each prompt should be 1-2 sentences long
- Make them exciting and engaging for children
- Include age-appropriate themes and content
- NO violence, scary content, or mature themes
- Focus on adventure, discovery, friendship, and positive values
- Use vivid, descriptive language that sparks imagination
- Make each prompt feel magical and inviting

RESPONSE FORMAT:
Return exactly 3 prompts as a JSON array of strings:
["Prompt 1", "Prompt 2", "Prompt 3"]`

  const userPrompt = `Generate 3 creative story prompts for the ${genre} genre that will inspire children to start an adventure.`

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
      temperature: 0.8,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from OpenAI')
  }

  try {
    // Try to parse as JSON first
    const prompts = JSON.parse(content)
    if (Array.isArray(prompts) && prompts.length === 3) {
      return prompts
    }
  } catch {
    // If JSON parsing fails, try to extract prompts from text
    const lines = content.split('\n').filter(line => line.trim())
    const prompts = lines
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(prompt => prompt.length > 10)
      .slice(0, 3)
    
    if (prompts.length === 3) {
      return prompts
    }
  }

  // Fallback prompts if AI generation fails
  return getFallbackPrompts(genre)
}

function getGenreInstructions(genre: string): string {
  const instructions: Record<string, string> = {
    'fantasy-magic': `Create enchanting fantasy prompts with:
- Magical elements that are friendly and helpful
- Whimsical characters and magical creatures
- Enchanted settings like floating libraries or crystal caves
- Themes of friendship, courage, and wonder
- Magic used for solving problems through kindness`,

    'adventure-exploration': `Create exciting adventure prompts with:
- Discovery of hidden places and treasures
- Exploration of mysterious locations
- Themes of curiosity, bravery, and friendship
- Safe adventures with positive outcomes
- Educational elements about different places or cultures`,

    'mystery-detective': `Create child-friendly mystery prompts with:
- Gentle puzzles and clues appropriate for young minds
- Problem-solving through observation and logic
- No scary or dangerous elements
- Mysteries that teach important lessons
- Satisfying solutions children can understand`,

    'horror-story': `Create gentle, age-appropriate "spooky" prompts with:
- Mild suspense that's exciting but not frightening
- Friendly ghosts or magical creatures
- Mysterious but safe situations
- Themes of friendship and overcoming fears
- Positive resolutions that reassure children`,

    'romantic-drama': `Create wholesome friendship and family prompts with:
- Themes of friendship, love, and family bonds
- Heartwarming situations and relationships
- Positive social interactions
- Age-appropriate emotional development
- Stories about caring for others`,

    'child-adapted': `Create gentle, simple prompts for young children with:
- Simple vocabulary and concepts
- Familiar settings like home, school, or playground
- Friendly characters and safe situations
- Themes of friendship, sharing, and kindness
- Calm, reassuring tone`,

    'educational': `Create learning-focused prompts with:
- Educational content woven into engaging stories
- STEM concepts, history, or life lessons
- Characters who solve problems through learning
- Interactive elements that encourage curiosity
- Real-world applications of knowledge`,

    'sci-fi-thriller': `Create exciting sci-fi prompts with:
- Friendly technology and space exploration
- Scientific discovery and innovation
- Positive portrayal of science and learning
- Characters who solve problems through curiosity
- Inspiring wonder about science and space`
  }

  return instructions[genre] || instructions['fantasy-magic']
}

function getFallbackPrompts(genre: string): string[] {
  const fallbacks: Record<string, string[]> = {
    'fantasy-magic': [
      'A magical door appears in your bedroom wall, and a friendly dragon invites you to explore a world of floating islands.',
      'You discover that your pet can talk and has been hiding a secret magical kingdom in your backyard.',
      'An ancient book in the library opens by itself and transports you to a realm where everyone can fly.'
    ],
    'adventure-exploration': [
      'Your grandfather\'s old compass doesn\'t point north—it points to hidden treasures in your neighborhood.',
      'You find a map in the attic that leads to a secret garden filled with talking animals.',
      'A mysterious invitation arrives, inviting you to join a club of young explorers who discover hidden worlds.'
    ],
    'mystery-detective': [
      'Every book you check out from the library contains a hidden message meant just for you.',
      'You notice that all the toys in your room are arranged differently each morning.',
      'A friendly ghost appears in your house and needs help solving a gentle mystery.'
    ],
    'horror-story': [
      'A friendly ghost moves into your house and becomes your best friend, helping you with homework.',
      'You discover that your shadow has a mind of its own and wants to play games with you.',
      'The old tree in your backyard starts whispering friendly secrets to you at night.'
    ],
    'romantic-drama': [
      'You meet a new student at school who seems sad and needs a friend to help them feel welcome.',
      'Your family moves to a new house and you discover a magical pen pal who lives in the walls.',
      'You find a lost puppy and must help it find its way back to a loving family.'
    ],
    'child-adapted': [
      'Your pet hamster starts talking and tells you about adventures in a tiny world under your bed.',
      'The crayons in your art box come to life and help you create the most beautiful drawing ever.',
      'You discover that your teddy bear can fly and takes you on gentle adventures while you sleep.'
    ],
    'educational': [
      'You shrink down to explore the human body and learn how it works from the inside.',
      'A time machine takes you back to ancient Egypt where you help build the pyramids using math.',
      'You become friends with a robot who teaches you about science through fun experiments.'
    ],
    'sci-fi-thriller': [
      'Your new smartphone starts receiving messages from your future self about amazing discoveries.',
      'You wake up on a friendly space station where robots help you learn about the solar system.',
      'A friendly alien visits your school and needs help understanding Earth\'s customs.'
    ]
  }

  return fallbacks[genre] || fallbacks['fantasy-magic']
} 