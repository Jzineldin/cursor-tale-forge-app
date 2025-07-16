// Simplified Contextual Choice Generation for TaleForge
// Generates choices AFTER story content based on actual story events

export interface ContextualChoiceRequest {
  storyText: string;
  genre: string;
  previousChoices?: string[];
  characterNames?: string[];
  currentLocation?: string;
}

export interface ContextualChoiceResponse {
  choices: string[];
  reasoning: string[];
  choiceTypes: string[];
}

export async function generateContextualChoices(
  request: ContextualChoiceRequest
): Promise<ContextualChoiceResponse> {
  const {
    storyText,
    genre,
    previousChoices = [],
    characterNames = [],
    currentLocation
  } = request;

  console.log('[Contextual Choices] Analyzing story content for choice generation');

  // Analyze the story content to extract key elements
  const analysis = analyzeStoryContent(storyText);
  
  // Build contextual prompt for choice generation
  const choicePrompt = buildChoicePrompt(storyText, genre, analysis, characterNames, currentLocation);

  try {
    // Generate choices using AI with full story context
    const choiceResponse = await callChoiceAPI(choicePrompt);
    
    // Validate and enhance choices
    const validatedChoices = validateChoices(choiceResponse.choices, analysis, previousChoices);

    return {
      choices: validatedChoices,
      reasoning: choiceResponse.reasoning,
      choiceTypes: choiceResponse.choiceTypes
    };
  } catch (error) {
    console.warn('[Contextual Choices] API call failed, using fallback choices');
    return generateFallbackChoices(storyText, genre);
  }
}

interface StoryElements {
  characters: string[];
  locations: string[];
  objects: string[];
  emotions: string[];
  actions: string[];
}

function analyzeStoryContent(storyText: string): StoryElements {
  return {
    characters: extractCharacters(storyText),
    locations: extractLocations(storyText), 
    objects: extractObjects(storyText),
    emotions: extractEmotions(storyText),
    actions: extractActions(storyText)
  };
}

function extractCharacters(text: string): string[] {
  const characters = new Set<string>();
  
  // Look for capitalized names
  const namePattern = /\b[A-Z][a-z]+\b/g;
  const matches = text.match(namePattern) || [];
  
  matches.forEach(match => {
    // Filter out common words that aren't names
    if (!['The', 'And', 'But', 'She', 'He', 'They', 'It', 'This', 'That'].includes(match)) {
      characters.add(match);
    }
  });

  return Array.from(characters).slice(0, 3);
}

function extractLocations(text: string): string[] {
  const locationWords = ['garden', 'backyard', 'pond', 'forest', 'cave', 'room', 'playground', 'school'];
  const locations: string[] = [];
  
  locationWords.forEach(location => {
    if (text.toLowerCase().includes(location)) {
      locations.push(location);
    }
  });

  return locations.slice(0, 2);
}

function extractObjects(text: string): string[] {
  const objectWords = ['crayon', 'paper', 'bird', 'fish', 'flower', 'tree', 'water', 'book', 'key'];
  const objects: string[] = [];
  
  objectWords.forEach(object => {
    if (text.toLowerCase().includes(object)) {
      objects.push(object);
    }
  });

  return objects.slice(0, 3);
}

function extractEmotions(text: string): string[] {
  const emotions = ['excited', 'curious', 'amazed', 'happy', 'surprised', 'proud'];
  const found: string[] = [];
  
  emotions.forEach(emotion => {
    if (text.toLowerCase().includes(emotion)) {
      found.push(emotion);
    }
  });

  return found.slice(0, 2);
}

function extractActions(text: string): string[] {
  const actions = ['drew', 'created', 'discovered', 'found', 'looked', 'touched', 'made'];
  const found: string[] = [];
  
  actions.forEach(action => {
    if (text.toLowerCase().includes(action)) {
      found.push(action);
    }
  });

  return found.slice(0, 3);
}

function buildChoicePrompt(
  storyText: string,
  genre: string,
  analysis: StoryElements,
  characterNames: string[],
  currentLocation?: string
): string {
  return `Generate 3 contextual story choices based on this EXACT story content.

STORY TEXT:
"${storyText}"

ANALYSIS:
- Characters: ${analysis.characters.join(', ') || 'None'}
- Location: ${currentLocation || analysis.locations[0] || 'Unknown'}
- Objects: ${analysis.objects.join(', ') || 'None'}
- Emotions: ${analysis.emotions.join(', ') || 'Neutral'}
- Actions: ${analysis.actions.join(', ') || 'None'}

GENRE: ${genre}

REQUIREMENTS:
1. Choices MUST relate to what actually happened in the story above
2. Reference specific characters, objects, or situations from the text
3. Each choice should offer a different type of action:
   - Choice 1: Character interaction or relationship building
   - Choice 2: Exploration or problem-solving action
   - Choice 3: Creative or learning opportunity

SAFETY: All choices must be child-appropriate (ages 4-12), positive, and safe.

GUIDELINES:
- Keep choices 8-15 words each
- Start with action verbs when possible
- Make each choice feel different from the others
- Reference specific story elements

Generate exactly 3 choices that feel like natural next steps from this story.`;
}

async function callChoiceAPI(prompt: string): Promise<{
  choices: string[];
  reasoning: string[];
  choiceTypes: string[];
}> {
  const response = await fetch(process.env.OVH_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OVH_AI_ENDPOINTS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-instruct',
      messages: [
        {
          role: 'system',
          content: 'Generate choices for children\'s stories. Respond with JSON: {"choices": ["choice1", "choice2", "choice3"], "reasoning": ["why1", "why2", "why3"], "choiceTypes": ["character", "exploration", "creative"]}'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`Choice API failed: ${response.status}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  
  return {
    choices: parsed.choices || [],
    reasoning: parsed.reasoning || [],
    choiceTypes: parsed.choiceTypes || ['character', 'exploration', 'creative']
  };
}

function validateChoices(
  choices: string[],
  analysis: StoryElements,
  previousChoices: string[]
): string[] {
  return choices.map(choice => {
    // Make child-friendly
    let enhanced = choice
      .replace(/investigate/gi, 'look around')
      .replace(/examine/gi, 'take a closer look at')
      .replace(/analyze/gi, 'think about');

    // Ensure not too similar to previous choices
    if (previousChoices.some(prev => 
      prev.toLowerCase().includes(choice.toLowerCase().substring(0, 8))
    )) {
      enhanced = `Try something different: ${enhanced}`;
    }

    return enhanced;
  });
}

function generateFallbackChoices(storyText: string, genre: string): ContextualChoiceResponse {
  // Extract one key element from the story for more relevant fallback choices
  const words = storyText.split(' ');
  const keyElement = words.find(word => 
    word.length > 3 && 
    word[0] === word[0].toUpperCase() &&
    !['The', 'And', 'But', 'She', 'He', 'They'].includes(word)
  ) || 'the discovery';

  const choices = [
    `Talk to someone about ${keyElement.toLowerCase()}`,
    `Explore what ${keyElement.toLowerCase()} can do`,
    `Try something creative with ${keyElement.toLowerCase()}`
  ];

  return {
    choices,
    reasoning: [
      'Character interaction builds relationships',
      'Exploration reveals new possibilities', 
      'Creative action opens new opportunities'
    ],
    choiceTypes: ['character', 'exploration', 'creative']
  };
} 