import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface StorySegment {
  id: string;
  segment_text: string;
  image_prompt?: string;
  choices?: string[];
  created_at: string;
  parent_segment_id?: string;
}

export interface NarrativeContext {
  summary: string;
  currentObjective: string;
  arcStage: string;
  previousSegments: string;
  characters: CharacterInfo[];
  setting: SettingInfo;
  plotThreads: PlotThread[];
  worldRules: WorldRule[];
  tone: string;
  genre: string;
  consistencyWarnings: string[];
}

export interface CharacterInfo {
  name: string;
  description: string;
  role: string;
  personality: string;
  appearance: string;
  relationships: string[];
}

export interface SettingInfo {
  location: string;
  description: string;
  atmosphere: string;
  timePeriod: string;
  weather: string;
}

export interface PlotThread {
  id: string;
  description: string;
  status: 'active' | 'resolved' | 'introduced';
  importance: 'major' | 'minor';
}

export interface WorldRule {
  category: string;
  rule: string;
  established: boolean;
}

/**
 * Builds comprehensive narrative context from previous story segments
 * to maintain consistency and prevent narrative drift
 */
export async function buildNarrativeContext(
  previousSegments: StorySegment[],
  storyMode: string,
  initialPrompt?: string
): Promise<NarrativeContext> {
  console.log('🏗️ Building comprehensive narrative context...');
  
  if (previousSegments.length === 0) {
    // For new stories, create initial context based on the prompt
    return buildInitialContext(initialPrompt || '', storyMode);
  }

  // Extract and analyze previous segments
  const segmentTexts = previousSegments.map(s => s.segment_text);
  const fullStoryText = segmentTexts.join('\n\n');
  
  // Build context from existing story
  const context = await analyzeStoryContent(fullStoryText, storyMode, previousSegments);
  
  console.log('✅ Narrative context built successfully');
  return context;
}

/**
 * Builds initial context for new stories
 */
function buildInitialContext(initialPrompt: string, storyMode: string): NarrativeContext {
  console.log('🎬 Building initial context for new story');
  
  // Extract key elements from the initial prompt
  const promptAnalysis = analyzeInitialPrompt(initialPrompt, storyMode);
  
  return {
    summary: `Beginning of ${storyMode} story: ${initialPrompt}`,
    currentObjective: 'Establish the story world and introduce the main character(s)',
    arcStage: 'setup',
    previousSegments: '',
    characters: promptAnalysis.characters,
    setting: promptAnalysis.setting,
    plotThreads: [
      {
        id: 'main-conflict',
        description: 'The central conflict or challenge introduced in the story',
        status: 'introduced',
        importance: 'major'
      }
    ],
    worldRules: promptAnalysis.worldRules,
    tone: promptAnalysis.tone,
    genre: storyMode,
    consistencyWarnings: []
  };
}

/**
 * Analyzes the initial prompt to extract story elements
 */
function analyzeInitialPrompt(prompt: string, storyMode: string): {
  characters: CharacterInfo[];
  setting: SettingInfo;
  worldRules: WorldRule[];
  tone: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine tone based on story mode and prompt
  let tone = 'adventurous';
  if (storyMode.includes('horror') || lowerPrompt.includes('dark') || lowerPrompt.includes('scary')) {
    tone = 'dark and mysterious';
  } else if (storyMode.includes('romantic') || lowerPrompt.includes('love') || lowerPrompt.includes('romance')) {
    tone = 'romantic and emotional';
  } else if (storyMode.includes('comedy') || lowerPrompt.includes('funny') || lowerPrompt.includes('humor')) {
    tone = 'lighthearted and humorous';
  } else if (storyMode.includes('mystery') || lowerPrompt.includes('mystery') || lowerPrompt.includes('detective')) {
    tone = 'suspenseful and mysterious';
  }
  
  // Extract potential characters from prompt
  const characters: CharacterInfo[] = [];
  const characterMatches = prompt.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g);
  if (characterMatches && characterMatches.length > 0) {
    // Assume the first capitalized name is the main character
    const mainCharacter = characterMatches[0];
    characters.push({
      name: mainCharacter,
      description: `Main character introduced in the story`,
      role: 'protagonist',
      personality: 'To be developed through the story',
      appearance: 'To be described in the story',
      relationships: []
    });
  }
  
  // Extract setting information
  const setting: SettingInfo = {
    location: extractLocation(prompt, storyMode),
    description: 'To be developed through the story',
    atmosphere: tone,
    timePeriod: extractTimePeriod(prompt, storyMode),
    weather: 'To be described in the story'
  };
  
  // Define world rules based on genre
  const worldRules: WorldRule[] = buildGenreWorldRules(storyMode);
  
  return { characters, setting, worldRules, tone };
}

/**
 * Analyzes existing story content to build comprehensive context
 */
async function analyzeStoryContent(
  fullStoryText: string,
  storyMode: string,
  previousSegments: StorySegment[]
): Promise<NarrativeContext> {
  console.log('🔍 Analyzing existing story content...');
  
  // Extract characters mentioned in the story
  const characters = extractCharacters(fullStoryText);
  
  // Extract current setting
  const setting = extractCurrentSetting(fullStoryText, storyMode);
  
  // Identify active plot threads
  const plotThreads = identifyPlotThreads(fullStoryText, previousSegments);
  
  // Extract world rules that have been established
  const worldRules = extractWorldRules(fullStoryText, storyMode);
  
  // Determine current story stage
  const arcStage = determineArcStage(previousSegments.length, plotThreads);
  
  // Build summary
  const summary = buildStorySummary(fullStoryText, characters, setting);
  
  // Determine current objective
  const currentObjective = determineCurrentObjective(plotThreads, arcStage);
  
  // Determine tone
  const tone = determineTone(fullStoryText, storyMode);
  
  // Add consistency warnings if setting has changed unexpectedly
  const consistencyWarnings = generateConsistencyWarnings(previousSegments, setting);
  
  return {
    summary,
    currentObjective,
    arcStage,
    previousSegments: fullStoryText.substring(0, 2000), // Limit context length
    characters,
    setting,
    plotThreads,
    worldRules,
    tone,
    genre: storyMode,
    consistencyWarnings
  };
}

/**
 * Generates warnings about potential narrative inconsistencies
 */
function generateConsistencyWarnings(previousSegments: StorySegment[], currentSetting: SettingInfo): string[] {
  const warnings: string[] = [];
  
  if (previousSegments.length === 0) {
    return warnings; // No previous context to compare against
  }
  
  // Check for setting changes across segments
  const allSegmentTexts = previousSegments.map(s => s.segment_text.toLowerCase());
  const currentLocation = currentSetting.location.toLowerCase();
  
  // Look for location keywords in previous segments
  const locationKeywords = ['pyramid', 'forest', 'castle', 'city', 'village', 'mountain', 'cave', 'house', 'room', 'street', 'beach', 'island', 'space', 'planet', 'ship', 'school', 'library', 'museum'];
  
  const previousLocations = locationKeywords.filter(keyword => 
    allSegmentTexts.some(text => text.includes(keyword))
  );
  
  // If we found a previous location that's different from current, warn
  if (previousLocations.length > 0 && !previousLocations.some(loc => currentLocation.includes(loc))) {
    warnings.push(`WARNING: Story previously took place in ${previousLocations.join(', ')} but current setting is ${currentSetting.location}. Maintain consistency.`);
  }
  
  // Check for tone changes
  const toneKeywords = {
    'dark': ['dark', 'shadow', 'creepy', 'scary', 'horror'],
    'bright': ['bright', 'sunny', 'cheerful', 'happy', 'joyful'],
    'magical': ['magical', 'enchanted', 'mystical', 'wonder', 'spell'],
    'romantic': ['romantic', 'love', 'heart', 'passion', 'romance']
  };
  
  const currentTone = Object.entries(toneKeywords).find(([_, keywords]) => 
    keywords.some(keyword => currentLocation.includes(keyword) || currentSetting.atmosphere.includes(keyword))
  )?.[0] || 'neutral';
  
  const previousTones = Object.entries(toneKeywords).filter(([_, keywords]) => 
    keywords.some(keyword => allSegmentTexts.some(text => text.includes(keyword)))
  ).map(([tone, _]) => tone);
  
  if (previousTones.length > 0 && !previousTones.includes(currentTone)) {
    warnings.push(`WARNING: Story tone has changed from ${previousTones.join(', ')} to ${currentTone}. Maintain consistent atmosphere.`);
  }
  
  return warnings;
}

/**
 * Extracts character information from story text
 */
function extractCharacters(storyText: string): CharacterInfo[] {
  const characters: CharacterInfo[] = [];
  
  // Find character names (capitalized words that appear multiple times)
  const words = storyText.split(/\s+/);
  const nameCounts: { [key: string]: number } = {};
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 2 && /^[A-Z]/.test(cleanWord)) {
      nameCounts[cleanWord] = (nameCounts[cleanWord] || 0) + 1;
    }
  });
  
  // Consider characters that appear at least twice
  Object.entries(nameCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5) // Limit to top 5 characters
    .forEach(([name, count]) => {
      characters.push({
        name,
        description: `Character mentioned ${count} times in the story`,
        role: count > 3 ? 'main character' : 'supporting character',
        personality: 'To be developed through the story',
        appearance: 'To be described in the story',
        relationships: []
      });
    });
  
  return characters;
}

/**
 * Extracts current setting information
 */
function extractCurrentSetting(storyText: string, storyMode: string): SettingInfo {
  const lowerText = storyText.toLowerCase();
  
  // Extract location mentions
  let location = 'Unknown location';
  const locationKeywords = ['pyramid', 'forest', 'castle', 'city', 'village', 'mountain', 'cave', 'house', 'room', 'street', 'beach', 'island', 'space', 'planet', 'ship'];
  
  for (const keyword of locationKeywords) {
    if (lowerText.includes(keyword)) {
      location = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      break;
    }
  }
  
  // Extract time period
  const timePeriod = extractTimePeriod(storyText, storyMode);
  
  // Determine atmosphere based on content
  let atmosphere = 'neutral';
  if (lowerText.includes('dark') || lowerText.includes('shadow') || lowerText.includes('creepy')) {
    atmosphere = 'dark and mysterious';
  } else if (lowerText.includes('bright') || lowerText.includes('sunny') || lowerText.includes('cheerful')) {
    atmosphere = 'bright and cheerful';
  } else if (lowerText.includes('magical') || lowerText.includes('enchanted') || lowerText.includes('mystical')) {
    atmosphere = 'magical and enchanting';
  }
  
  return {
    location,
    description: `Current setting in the story`,
    atmosphere,
    timePeriod,
    weather: 'To be described in the story'
  };
}

/**
 * Identifies active plot threads in the story
 */
function identifyPlotThreads(storyText: string, previousSegments: StorySegment[]): PlotThread[] {
  const plotThreads: PlotThread[] = [];
  
  // Look for conflict indicators
  const conflictKeywords = ['problem', 'challenge', 'danger', 'threat', 'mystery', 'quest', 'mission', 'goal', 'need', 'must', 'should'];
  const lowerText = storyText.toLowerCase();
  
  conflictKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      plotThreads.push({
        id: `conflict-${keyword}`,
        description: `Story involves a ${keyword} that needs to be addressed`,
        status: 'active',
        importance: 'major'
      });
    }
  });
  
  // Add character development thread
  if (storyText.match(/\b[A-Z][a-z]+\b/g)) {
    plotThreads.push({
      id: 'character-development',
      description: 'Character growth and development',
      status: 'active',
      importance: 'major'
    });
  }
  
  return plotThreads;
}

/**
 * Extracts world rules that have been established
 */
function extractWorldRules(storyText: string, storyMode: string): WorldRule[] {
  const worldRules: WorldRule[] = [];
  
  // Add genre-specific rules
  worldRules.push(...buildGenreWorldRules(storyMode));
  
  // Extract specific rules mentioned in the story
  const lowerText = storyText.toLowerCase();
  
  if (lowerText.includes('magic') || lowerText.includes('spell') || lowerText.includes('wizard')) {
    worldRules.push({
      category: 'magic',
      rule: 'Magic exists in this world',
      established: true
    });
  }
  
  if (lowerText.includes('pyramid') || lowerText.includes('egypt') || lowerText.includes('ancient')) {
    worldRules.push({
      category: 'setting',
      rule: 'Story takes place in or involves ancient Egyptian setting',
      established: true
    });
  }
  
  if (lowerText.includes('forest') || lowerText.includes('tree') || lowerText.includes('nature')) {
    worldRules.push({
      category: 'setting',
      rule: 'Story involves natural/forest environment',
      established: true
    });
  }
  
  return worldRules;
}

/**
 * Builds genre-specific world rules
 */
function buildGenreWorldRules(storyMode: string): WorldRule[] {
  const rules: WorldRule[] = [];
  
  if (storyMode.includes('fantasy')) {
    rules.push(
      { category: 'magic', rule: 'Magic and supernatural elements exist', established: true },
      { category: 'setting', rule: 'Story takes place in a fantasy world', established: true }
    );
  } else if (storyMode.includes('sci-fi')) {
    rules.push(
      { category: 'technology', rule: 'Advanced technology exists', established: true },
      { category: 'setting', rule: 'Story involves futuristic or space elements', established: true }
    );
  } else if (storyMode.includes('mystery')) {
    rules.push(
      { category: 'plot', rule: 'Story involves solving a mystery or puzzle', established: true },
      { category: 'tone', rule: 'Story maintains suspense and intrigue', established: true }
    );
  } else if (storyMode.includes('horror')) {
    rules.push(
      { category: 'tone', rule: 'Story maintains dark and scary atmosphere', established: true },
      { category: 'content', rule: 'Story involves supernatural or frightening elements', established: true }
    );
  }
  
  return rules;
}

/**
 * Determines the current story arc stage
 */
function determineArcStage(segmentCount: number, plotThreads: PlotThread[]): string {
  if (segmentCount === 0) return 'setup';
  if (segmentCount <= 2) return 'introduction';
  if (segmentCount <= 5) return 'development';
  if (segmentCount <= 8) return 'rising-action';
  if (segmentCount <= 10) return 'climax';
  return 'resolution';
}

/**
 * Builds a concise story summary
 */
function buildStorySummary(storyText: string, characters: CharacterInfo[], setting: SettingInfo): string {
  const mainCharacter = characters.find(c => c.role === 'main character')?.name || 'the protagonist';
  const location = setting.location;
  
  return `A ${setting.atmosphere} story about ${mainCharacter} in ${location}. The story continues to develop with new challenges and discoveries.`;
}

/**
 * Determines the current objective based on plot threads and arc stage
 */
function determineCurrentObjective(plotThreads: PlotThread[], arcStage: string): string {
  if (arcStage === 'setup' || arcStage === 'introduction') {
    return 'Establish the story world and introduce the main character(s)';
  }
  
  const activeThreads = plotThreads.filter(t => t.status === 'active');
  if (activeThreads.length > 0) {
    const mainThread = activeThreads.find(t => t.importance === 'major');
    if (mainThread) {
      return `Address the ${mainThread.description.toLowerCase()}`;
    }
  }
  
  return 'Continue the adventure and develop the story';
}

/**
 * Determines the story tone
 */
function determineTone(storyText: string, storyMode: string): string {
  const lowerText = storyText.toLowerCase();
  
  if (lowerText.includes('dark') || lowerText.includes('scary') || lowerText.includes('horror')) {
    return 'dark and mysterious';
  } else if (lowerText.includes('magical') || lowerText.includes('enchanted') || lowerText.includes('wonder')) {
    return 'magical and enchanting';
  } else if (lowerText.includes('funny') || lowerText.includes('humor') || lowerText.includes('laugh')) {
    return 'lighthearted and humorous';
  } else if (lowerText.includes('romantic') || lowerText.includes('love') || lowerText.includes('heart')) {
    return 'romantic and emotional';
  }
  
  return 'adventurous and engaging';
}

/**
 * Extracts location from prompt or story text
 */
function extractLocation(text: string, storyMode: string): string {
  const lowerText = text.toLowerCase();
  
  const locationKeywords = [
    'pyramid', 'egypt', 'desert', 'forest', 'castle', 'city', 'village', 
    'mountain', 'cave', 'house', 'room', 'street', 'beach', 'island', 
    'space', 'planet', 'ship', 'school', 'library', 'museum'
  ];
  
  for (const keyword of locationKeywords) {
    if (lowerText.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  // Default locations based on genre
  if (storyMode.includes('fantasy')) return 'Fantasy realm';
  if (storyMode.includes('sci-fi')) return 'Futuristic setting';
  if (storyMode.includes('mystery')) return 'Mysterious location';
  if (storyMode.includes('horror')) return 'Dark and scary place';
  
  return 'Story location';
}

/**
 * Extracts time period from text
 */
function extractTimePeriod(text: string, storyMode: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('ancient') || lowerText.includes('egypt') || lowerText.includes('pyramid')) {
    return 'Ancient times';
  } else if (lowerText.includes('future') || lowerText.includes('space') || lowerText.includes('robot')) {
    return 'Future';
  } else if (lowerText.includes('medieval') || lowerText.includes('castle') || lowerText.includes('knight')) {
    return 'Medieval times';
  } else if (lowerText.includes('modern') || lowerText.includes('today') || lowerText.includes('present')) {
    return 'Modern day';
  }
  
  // Default based on genre
  if (storyMode.includes('fantasy')) return 'Medieval fantasy era';
  if (storyMode.includes('sci-fi')) return 'Future';
  if (storyMode.includes('mystery')) return 'Modern day';
  
  return 'Timeless';
} 