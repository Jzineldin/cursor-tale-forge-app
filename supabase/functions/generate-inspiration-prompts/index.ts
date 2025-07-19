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
    const { genre, age } = await req.json()

    if (!genre) {
      return new Response(
        JSON.stringify({ error: 'Genre is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate AI prompts based on genre and age
    const prompts = await generateGenrePrompts(genre, age)

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

async function generateGenrePrompts(genre: string, age?: string): Promise<string[]> {
  const ovhAccessToken = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
  
  if (!ovhAccessToken) {
    throw new Error('OVH AI access token not available')
  }

  const genreInstructions = getGenreInstructions(genre)
  const ageInstructions = getAgeInstructions(age)
  
  const systemPrompt = `You are an expert children's storyteller creating engaging, age-appropriate story prompts for children.

${genreInstructions}

${ageInstructions}

CRITICAL REQUIREMENTS:
- Generate exactly 5 unique, creative story prompts
- Each prompt should be 1-2 sentences long
- Make them exciting and engaging for children
- Include age-appropriate themes and content
- NO violence, scary content, or mature themes
- Focus on adventure, discovery, friendship, and positive values
- Use vivid, descriptive language that sparks imagination
- Make each prompt feel magical and inviting

RESPONSE FORMAT:
Return exactly 5 prompts as a JSON array of strings:
["Prompt 1", "Prompt 2", "Prompt 3", "Prompt 4", "Prompt 5"]`

  const userPrompt = `Generate 5 creative story prompts for the ${genre} genre that will inspire children to start an adventure.`

  const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ovhAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen2.5-Coder-32B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    })
  })

  if (!response.ok) {
    throw new Error(`OVH AI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from OVH AI')
  }

  try {
    // Parse the JSON response
    const parsed = JSON.parse(content)
    
    // Check if it's an array of prompts
    if (Array.isArray(parsed) && parsed.length === 5) {
      return parsed
    }
    
    // Check if it's an object with prompts property
    if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length === 5) {
      return parsed.prompts
    }
    
    // Check if it's an object with individual prompt properties
    if (parsed.prompt1 && parsed.prompt2 && parsed.prompt3 && parsed.prompt4 && parsed.prompt5) {
      return [parsed.prompt1, parsed.prompt2, parsed.prompt3, parsed.prompt4, parsed.prompt5]
    }
  } catch {
    // If JSON parsing fails, try to extract prompts from text
    const lines = content.split('\n').filter(line => line.trim())
    const prompts = lines
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(prompt => prompt.length > 10)
      .slice(0, 5)
    
    if (prompts.length === 5) {
      return prompts
    }
  }

  // Fallback prompts if AI generation fails
  return getFallbackPrompts(genre)
}

function getAgeInstructions(age?: string): string {
  if (!age) return ''
  
  const ageInstructions: Record<string, string> = {
    '4-6': `AGE-SPECIFIC GUIDELINES (4-6 years):
- Use simple vocabulary and short sentences
- Focus on familiar settings: home, school, playground
- Include friendly animals and magical creatures
- Themes: friendship, sharing, helping others
- Gentle adventures with happy endings
- Lots of repetition and familiar patterns`,

    '7-9': `AGE-SPECIFIC GUIDELINES (7-9 years):
- Use more descriptive language but keep it accessible
- Include problem-solving and discovery
- Themes: bravery, curiosity, friendship, family
- Can include mild challenges that are overcome
- Educational elements woven naturally into stories
- Encourage imagination and creativity`,

    '10-12': `AGE-SPECIFIC GUIDELINES (10-12 years):
- More complex plots and character development
- Include themes of independence and responsibility
- Can explore deeper emotions and relationships
- Educational content that challenges thinking
- Adventure and exploration themes
- Encourage critical thinking and empathy`
  }

  return ageInstructions[age] || ''
}

function getGenreInstructions(genre: string): string {
  const instructions: Record<string, string> = {
    'bedtime-stories': `Create gentle, calming bedtime story prompts with:
- Soothing and peaceful themes
- Gentle adventures that end with comfort
- Magical elements that are warm and friendly
- Themes of safety, love, and peaceful dreams
- Calming settings like cozy bedrooms or gentle nature
- Perfect for winding down before sleep`,

    'fantasy-and-magic': `Create enchanting fantasy prompts with:
- Magical elements that are friendly and helpful
- Whimsical characters and magical creatures
- Enchanted settings like floating libraries or crystal caves
- Themes of friendship, courage, and wonder
- Magic used for solving problems through kindness
- Sparkling, colorful magical worlds`,

    'adventure-and-exploration': `Create exciting adventure prompts with:
- Discovery of hidden places and treasures
- Exploration of mysterious locations
- Themes of curiosity, bravery, and friendship
- Safe adventures with positive outcomes
- Educational elements about different places or cultures
- Maps, compasses, and exploration tools`,

    'mystery-and-detective': `Create child-friendly mystery prompts with:
- Gentle puzzles and clues appropriate for young minds
- Problem-solving through observation and logic
- No scary or dangerous elements
- Mysteries that teach important lessons
- Satisfying solutions children can understand
- Detective work that's fun and educational`,

    'science-fiction-and-space': `Create exciting sci-fi prompts with:
- Friendly technology and space exploration
- Scientific discovery and innovation
- Positive portrayal of science and learning
- Characters who solve problems through curiosity
- Inspiring wonder about science and space
- Robots, aliens, and space adventures`,

    'educational-stories': `Create learning-focused prompts with:
- Educational content woven into engaging stories
- STEM concepts, history, or life lessons
- Characters who solve problems through learning
- Interactive elements that encourage curiosity
- Real-world applications of knowledge
- Fun ways to learn about science, math, history`,

    'values-and-life-lessons': `Create wholesome life lesson prompts with:
- Themes of friendship, love, and family bonds
- Positive social interactions and moral choices
- Age-appropriate emotional development
- Stories about caring for others and doing good
- Important life lessons taught through stories
- Character development and personal growth`,

    'silly-and-humorous': `Create fun and silly prompts with:
- Lighthearted humor appropriate for children
- Playful situations and funny characters
- Safe, gentle comedy that makes kids laugh
- Whimsical and absurd but not scary
- Positive messages wrapped in humor
- Fun wordplay and silly adventures`
  }

  return instructions[genre] || instructions['fantasy-and-magic']
}

function getFallbackPrompts(genre: string): string[] {
  const fallbacks: Record<string, string[]> = {
    'bedtime-stories': [
      'A magical moonbeam visits your bedroom and takes you on a gentle adventure through the stars.',
      'Your stuffed animals come to life at midnight and throw a peaceful tea party.',
      'A friendly cloud floats down to your window and offers to show you how to make rainbows.',
      'You discover a secret door in your closet that leads to a land where dreams are made.',
      'A wise old owl teaches you the language of the night and helps you understand your dreams.'
    ],
    'fantasy-and-magic': [
      'A magical door appears in your bedroom wall, and a friendly dragon invites you to explore a world of floating islands.',
      'You discover that your pet can talk and has been hiding a secret magical kingdom in your backyard.',
      'An ancient book in the library opens by itself and transports you to a realm where everyone can fly.',
      'A mysterious wizard appears in your backyard and asks for your help to save magic itself.',
      'You inherit a magical library where the stories inside the books are real and need your help.'
    ],
    'adventure-and-exploration': [
      'Your grandfather\'s old compass doesn\'t point north—it points to hidden treasures in your neighborhood.',
      'You find a map in the attic that leads to a secret garden filled with talking animals.',
      'A mysterious invitation arrives, inviting you to join a club of young explorers who discover hidden worlds.',
      'You discover that your school has secret passages leading to hidden worlds.',
      'A mysterious island appears on your local lake that wasn\'t there yesterday.'
    ],
    'mystery-and-detective': [
      'Every book you check out from the library contains a hidden message meant just for you.',
      'You notice that all the toys in your room are arranged differently each morning.',
      'A friendly ghost appears in your house and needs help solving a gentle mystery.',
      'You inherit your detective grandfather\'s office and find his unsolved case files.',
      'A mysterious package arrives at your door with clues to a treasure hunt.'
    ],
    'science-fiction-and-space': [
      'Your new smartphone starts receiving messages from your future self about amazing discoveries.',
      'You wake up on a friendly space station where robots help you learn about the solar system.',
      'A friendly alien visits your school and needs help understanding Earth\'s customs.',
      'You discover that your dreams are actually glimpses into parallel universes.',
      'A tiny alien crash-lands in your backyard and needs help fixing their spaceship.'
    ],
    'educational-stories': [
      'You shrink down to explore the human body and learn how it works from the inside.',
      'A time machine takes you back to ancient Egypt where you help build the pyramids using math.',
      'You become friends with a robot who teaches you about science through fun experiments.',
      'You discover a magical school where every subject is taught through real adventures.',
      'A talking computer virus teaches you about internet safety while trying to fix the digital world.'
    ],
    'values-and-life-lessons': [
      'You meet a new student at school who seems sad and needs a friend to help them feel welcome.',
      'You find a wallet full of money on the playground and must decide what to do.',
      'Your best friend starts spreading rumors about someone, and you have to choose what\'s right.',
      'You discover that your words have the power to make people feel better or worse.',
      'A magical mirror shows you how your actions affect others in ways you never imagined.'
    ],
    'silly-and-humorous': [
      'Your pet goldfish becomes a stand-up comedian and starts telling jokes to other pets.',
      'You wake up to find that gravity works backwards in your house for one day.',
      'Your school cafeteria food comes to life and starts a food fight revolution.',
      'You discover that your shadow has a mind of its own and keeps getting you into trouble.',
      'A magical remote control lets you change the channel on real life, but with hilarious consequences.'
    ]
  }

  return fallbacks[genre] || fallbacks['fantasy-and-magic']
} 