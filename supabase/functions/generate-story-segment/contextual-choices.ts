// Contextual Choice Generation System for TaleForge
// Generates choices AFTER story content is created, based on actual story events

export interface ContextualChoiceRequest {
  storyText: string;
  genre: string;
  previousChoices?: string[];
  storyContext?: any;
  characterNames?: string[];
  currentLocation?: string;
  activeElements?: string[];
}

export interface ContextualChoiceResponse {
  choices: string[];
  reasoning: string[];
  choiceTypes: ('plot' | 'character' | 'exploration' | 'learning')[];
}

export async function generateContextualChoices(
  request: ContextualChoiceRequest
): Promise<ContextualChoiceResponse> {
  const {
    storyText,
    genre,
    previousChoices = [],
    storyContext,
    characterNames = [],
    currentLocation,
    activeElements = []
  } = request;

  // Extract story elements from the generated text
  const storyAnalysis = analyzeStoryContent(storyText);
  
  // Build contextual prompt for choice generation
  const choicePrompt = buildContextualChoicePrompt(
    storyText,
    genre,
    storyAnalysis,
    characterNames,
    currentLocation,
    activeElements
  );

  // Generate choices using AI with full story context
  const choiceResponse = await callChoiceGenerationAPI(choicePrompt);
  
  // Validate and enhance choices
  const validatedChoices = validateAndEnhanceChoices(
    choiceResponse.choices,
    storyAnalysis,
    genre,
    previousChoices
  );

  return {
    choices: validatedChoices,
    reasoning: choiceResponse.reasoning,
    choiceTypes: choiceResponse.choiceTypes
  };
}

// Analyze the story content to extract key elements for choice generation
function analyzeStoryContent(storyText: string): StoryAnalysis {
  const analysis: StoryAnalysis = {
    characters: extractCharacters(storyText),
    locations: extractLocations(storyText),
    objects: extractObjects(storyText),
    emotions: extractEmotions(storyText),
    actions: extractActions(storyText),
    problems: extractProblems(storyText),
    opportunities: extractOpportunities(storyText),
    cliffhangers: extractCliffhangers(storyText),
    newElements: extractNewElements(storyText)
  };

  return analysis;
}

interface StoryAnalysis {
  characters: string[];
  locations: string[];
  objects: string[];
  emotions: string[];
  actions: string[];
  problems: string[];
  opportunities: string[];
  cliffhangers: string[];
  newElements: string[];
}

function extractCharacters(text: string): string[] {
  // Extract character names and references
  const patterns = [
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g, // Capitalized names
    /\bshe\b|\bhe\b|\bthey\b/gi, // Pronouns
    /\bthe\s+[a-z]+(?:\s+[a-z]+)?\b/g // "the dragon", "the children"
  ];
  
  const characters = new Set<string>();
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim().toLowerCase();
      // Filter out common words that aren't characters
      if (!['the', 'and', 'but', 'was', 'were', 'had', 'has', 'she', 'he', 'they'].includes(cleaned)) {
        characters.add(match.trim());
      }
    });
  });

  return Array.from(characters).slice(0, 5); // Limit to top 5
}

function extractLocations(text: string): string[] {
  const locationKeywords = [
    'room', 'cave', 'forest', 'garden', 'playground', 'school', 'house', 'castle',
    'pond', 'river', 'mountain', 'valley', 'field', 'park', 'library', 'kitchen',
    'bedroom', 'backyard', 'street', 'path', 'bridge', 'island', 'village', 'city'
  ];

  const locations = new Set<string>();
  
  locationKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      // Extract full location phrase
      const regex = new RegExp(`\\b[^.]*${keyword}[^.]*\\b`, 'gi');
      const matches = text.match(regex) || [];
      matches.forEach(match => {
        const cleaned = match.trim().substring(0, 50); // Limit length
        locations.add(cleaned);
      });
    }
  });

  return Array.from(locations).slice(0, 3);
}

function extractObjects(text: string): string[] {
  const objectKeywords = [
    'crayon', 'book', 'key', 'door', 'window', 'box', 'bag', 'treasure',
    'crystal', 'flower', 'tree', 'stone', 'water', 'fire', 'light', 'shadow',
    'paper', 'pencil', 'map', 'rope', 'ladder', 'bridge', 'boat', 'sword',
    'shield', 'wand', 'potion', 'crown', 'jewel', 'coin'
  ];

  const objects = new Set<string>();
  
  objectKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      // Extract object with descriptors
      const regex = new RegExp(`\\b[a-z]*\\s*${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      matches.forEach(match => objects.add(match.trim()));
    }
  });

  return Array.from(objects).slice(0, 5);
}

function extractEmotions(text: string): string[] {
  const emotionKeywords = [
    'excited', 'curious', 'amazed', 'happy', 'surprised', 'worried', 'scared',
    'brave', 'confident', 'hopeful', 'determined', 'proud', 'grateful',
    'friendly', 'kind', 'helpful', 'adventurous', 'creative', 'playful'
  ];

  const emotions = new Set<string>();
  
  emotionKeywords.forEach(emotion => {
    if (text.toLowerCase().includes(emotion)) {
      emotions.add(emotion);
    }
  });

  return Array.from(emotions).slice(0, 3);
}

function extractActions(text: string): string[] {
  const actionKeywords = [
    'drew', 'created', 'discovered', 'found', 'explored', 'climbed', 'walked',
    'ran', 'jumped', 'looked', 'listened', 'touched', 'opened', 'closed',
    'built', 'made', 'helped', 'solved', 'learned', 'taught', 'shared'
  ];

  const actions = new Set<string>();
  
  actionKeywords.forEach(action => {
    if (text.toLowerCase().includes(action)) {
      actions.add(action);
    }
  });

  return Array.from(actions).slice(0, 4);
}

function extractProblems(text: string): string[] {
  const problemIndicators = [
    'problem', 'challenge', 'difficulty', 'stuck', 'lost', 'broken', 'missing',
    'can\'t', 'couldn\'t', 'unable', 'confused', 'puzzled', 'wondered'
  ];

  const problems: string[] = [];
  
  problemIndicators.forEach(indicator => {
    if (text.toLowerCase().includes(indicator)) {
      // Extract sentence containing the problem
      const sentences = text.split(/[.!?]/);
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(indicator)) {
          problems.push(sentence.trim());
        }
      });
    }
  });

  return problems.slice(0, 2);
}

function extractOpportunities(text: string): string[] {
  const opportunityIndicators = [
    'could', 'might', 'maybe', 'perhaps', 'opportunity', 'chance', 'possible',
    'wonder', 'imagine', 'what if', 'decided to', 'thought about'
  ];

  const opportunities = [];
  
  opportunityIndicators.forEach(indicator => {
    if (text.toLowerCase().includes(indicator)) {
      // Extract relevant phrases
      const sentences = text.split(/[.!?]/);
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(indicator)) {
          opportunities.push(sentence.trim());
        }
      });
    }
  });

  return opportunities.slice(0, 2);
}

function extractCliffhangers(text: string): string[] {
  const cliffhangerIndicators = [
    'suddenly', 'then', 'just then', 'at that moment', 'unexpectedly',
    'to her surprise', 'to his surprise', 'amazingly', 'incredibly',
    'wondered what', 'looked at', 'heard', 'saw', 'noticed'
  ];

  const cliffhangers = [];
  
  // Look at the last few sentences for cliffhangers
  const sentences = text.split(/[.!?]/).slice(-3);
  
  sentences.forEach(sentence => {
    cliffhangerIndicators.forEach(indicator => {
      if (sentence.toLowerCase().includes(indicator)) {
        cliffhangers.push(sentence.trim());
      }
    });
  });

  return cliffhangers.slice(0, 2);
}

function extractNewElements(text: string): string[] {
  const newElementIndicators = [
    'appeared', 'emerged', 'arrived', 'came', 'showed up', 'found', 'discovered',
    'created', 'made', 'built', 'formed', 'grew', 'sprouted'
  ];

  const newElements = [];
  
  newElementIndicators.forEach(indicator => {
    if (text.toLowerCase().includes(indicator)) {
      const sentences = text.split(/[.!?]/);
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(indicator)) {
          newElements.push(sentence.trim());
        }
      });
    }
  });

  return newElements.slice(0, 3);
}

function buildContextualChoicePrompt(
  storyText: string,
  genre: string,
  analysis: StoryAnalysis,
  characterNames: string[],
  currentLocation?: string,
  activeElements: string[] = []
): string {
  let prompt = `Generate 3 contextual story choices based on this EXACT story content.

STORY TEXT TO ANALYZE:
"${storyText}"

STORY ANALYSIS:
- Characters present: ${analysis.characters.join(', ') || 'None detected'}
- Current location: ${currentLocation || analysis.locations[0] || 'Unknown'}
- Key objects: ${analysis.objects.join(', ') || 'None'}
- Character emotions: ${analysis.emotions.join(', ') || 'Neutral'}
- Recent actions: ${analysis.actions.join(', ') || 'None'}
- Active problems: ${analysis.problems.join('; ') || 'None'}
- New opportunities: ${analysis.opportunities.join('; ') || 'None'}

GENRE: ${genre}

CONTEXTUAL CHOICE REQUIREMENTS:
1. Choices MUST directly relate to what actually happened in the story text above
2. Reference specific characters, objects, or situations mentioned in the text
3. Build naturally from the story's ending situation
4. Each choice should advance the story in a different direction:
   - Choice 1: Character interaction/relationship building
   - Choice 2: Problem-solving/exploration action  
   - Choice 3: Creative/magical/learning opportunity

SAFETY REQUIREMENTS:
- All choices must be child-appropriate for ages 4-12
- No violence, scary content, or dangerous situations
- Focus on positive actions: helping, exploring, creating, learning
- Encourage cooperation and creativity

CHOICE GUIDELINES:
- Start choices with action verbs when possible
- Keep choices concise but specific (8-15 words)
- Make choices feel different from each other
- Reference specific story elements (characters, objects, locations)

Generate exactly 3 choices that feel like natural next steps from this specific story content.`;

  // Add genre-specific guidance
  switch (genre) {
    case 'fantasy-magic':
      prompt += `\n\nFANTASY FOCUS: Include magical elements, friendly creatures, or creative magic use`;
      break;
    case 'educational-adventure':
      prompt += `\n\nEDUCATIONAL FOCUS: Include learning opportunities, discovery, or scientific exploration`;
      break;
    case 'mystery-detective':
      prompt += `\n\nMYSTERY FOCUS: Include investigation, clue-finding, or problem-solving elements`;
      break;
    case 'bedtime-stories':
      prompt += `\n\nBEDTIME FOCUS: Keep choices calm and soothing, leading toward peaceful resolution`;
      break;
  }

  return prompt;
}

async function callChoiceGenerationAPI(prompt: string): Promise<{
  choices: string[];
  reasoning: string[];
  choiceTypes: ('plot' | 'character' | 'exploration' | 'learning')[];
}> {
  // Use the same API that generates story content, but focused on choices
  const apiUrl = Deno.env.get('OVH_API_URL') || 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions';
  const apiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a contextual choice generator for children\'s stories. Generate choices based on story analysis. Respond with JSON: {"choices": ["choice1", "choice2", "choice3"], "reasoning": ["why1", "why2", "why3"], "choiceTypes": ["plot", "character", "exploration"]}'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    console.warn('Choice generation API failed, using fallback');
    return generateFallbackChoices(prompt);
  }

  const data = await response.json();
  
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      choices: parsed.choices || [],
      reasoning: parsed.reasoning || [],
      choiceTypes: parsed.choiceTypes || ['plot', 'character', 'exploration']
    };
  } catch (error) {
    console.warn('Failed to parse choice response, using fallback');
    return generateFallbackChoices(prompt);
  }
}

function generateFallbackChoices(prompt: string): {
  choices: string[];
  reasoning: string[];
  choiceTypes: ('plot' | 'character' | 'exploration' | 'learning')[];
} {
  // Simple fallback choices that should work for most stories
  return {
    choices: [
      "Talk to the characters about what just happened",
      "Explore the current area more carefully", 
      "Try something creative or helpful"
    ],
    reasoning: [
      "Character interaction builds relationships",
      "Exploration reveals new story elements",
      "Creative action opens new possibilities"
    ],
    choiceTypes: ['character', 'exploration', 'learning']
  };
}

function validateAndEnhanceChoices(
  choices: string[],
  analysis: StoryAnalysis,
  genre: string,
  previousChoices: string[]
): string[] {
  return choices.map(choice => {
    let enhanced = choice;

    // Ensure choices are not too similar to previous ones
    if (previousChoices.some(prev => 
      prev.toLowerCase().includes(choice.toLowerCase().substring(0, 10))
    )) {
      enhanced = `Try a different approach: ${choice}`;
    }

    // Add specific character names if generic references are used
    if (enhanced.includes('the character') && analysis.characters.length > 0) {
      enhanced = enhanced.replace('the character', analysis.characters[0]);
    }

    // Ensure child-appropriate language
    enhanced = makeChildFriendly(enhanced);

    return enhanced;
  });
}

function makeChildFriendly(choice: string): string {
  // Replace any potentially unclear or complex language
  const replacements: { [key: string]: string } = {
    'investigate': 'look around',
    'examine': 'take a closer look at',
    'analyze': 'think about',
    'contemplate': 'wonder about',
    'utilize': 'use',
    'acquire': 'get',
    'attempt': 'try to'
  };

  let friendly = choice;
  Object.entries(replacements).forEach(([complex, simple]) => {
    friendly = friendly.replace(new RegExp(complex, 'gi'), simple);
  });

  return friendly;
}

// Main function exported at top of file 