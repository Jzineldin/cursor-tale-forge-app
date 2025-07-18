/**
 * Enhanced Genre-Specific Prompt Templates for Tale-Forge Backend
 * Ensures safe, age-appropriate, engaging content for children ages 4-12
 */

import { NarrativeContinuityEngine, StoryContext as NarrativeStoryContext, initializeStoryContext } from './narrative-continuity.ts';

export interface StoryContext {
  previousSegments?: string;
  characters?: Record<string, string>;
  setting?: string;
  genre?: string;
  userChoice?: string;
  summary?: string;
  currentObjective?: string;
  arcStage?: string;
}

/**
 * Builds enhanced system prompt with genre-specific safety and style guidelines
 */
export function buildSystemPrompt(genre: string, context: StoryContext = {}, targetAge: '4-6' | '7-9' | '10-12' = '7-9'): string {
  const genreInstructions = getGenreInstructions(genre);
  const ageInstructions = getAgeSpecificInstructions(targetAge);
  
  // Build context prompt
  let contextPrompt = '';
  if (context.previousSegments) {
    contextPrompt += `\n\nPREVIOUS STORY CONTEXT:\n${context.previousSegments}`;
  }

  if (context.characters && Object.keys(context.characters).length > 0) {
    const characterList = Object.entries(context.characters)
      .map(([name, desc]) => `${name}: ${desc}`)
      .join(', ');
    contextPrompt += `\n\nCHARACTERS TO MAINTAIN: ${characterList}`;
  }

  if (context.setting) {
    contextPrompt += `\n\nSETTING: ${context.setting}`;
  }

  return `You are TaleForge's advanced AI storyteller creating safe, educational, age-appropriate stories for children ages 4-12.

TARGET AGE GROUP: ${targetAge} years old

${ageInstructions}

${genreInstructions}

CRITICAL CONTENT SAFETY REQUIREMENTS:
- ABSOLUTELY NO violence, weapons, combat, blood, gore, or harm to any character
- NO scary, dark, or frightening content that could upset children
- NO mature themes, romantic content, or adult situations
- NO mean-spirited humor or characters being cruel to each other
- NO dangerous situations or risky behaviors children might imitate
- ALL content must be positive, uplifting, and promote good values
- ALL problems must be solved through kindness, cooperation, and creativity
- NO "scary", "dangerous", "menacing", "threatening", "evil", "monster", "beast" or similar frightening terms
- REPLACE any potentially scary content with "mysterious but friendly", "playful", "challenging", "friendly creature"

NARRATIVE CONSISTENCY REQUIREMENTS:
- ALWAYS maintain the established setting and location throughout each segment
- NEVER suddenly change locations or introduce unrelated settings
- CONTINUE with the same characters and their established traits
- FOLLOW the established world rules and genre conventions
- KEEP the story tone consistent with previous segments
- BUILD upon existing plot threads rather than starting new unrelated ones

STORY REQUIREMENTS:
- Generate exactly ${getAgeAppropriateWordCount(targetAge)} words for age-appropriate storytelling
- Create exactly 3 meaningful choices that advance both plot and character development
- Use age-appropriate language that children can understand and enjoy
- DO NOT include image descriptions or references to images within the segmentText
- DO NOT include choice prompts or transitions within the segmentText
- The segmentText should end naturally as part of the story narrative
- Weave educational content naturally into the narrative when appropriate
- Generate a separate imagePrompt field for visual generation (not in story text)

RESPONSE FORMAT (EXACT JSON):
{
  "segmentText": "A ${getAgeAppropriateWordCount(targetAge)} word story segment following all safety and genre guidelines",
  "choices": ["Choice 1 that advances plot", "Choice 2 that develops character", "Choice 3 that explores theme"],
  "isEnd": false,
  "imagePrompt": "Child-friendly, colorful, safe image description with positive descriptors",
  "visualContext": {"style": "children's book illustration", "characters": {"name": "description"}, "setting": "current location"},
  "narrativeContext": {"summary": "updated story summary", "currentObjective": "next goal", "arcStage": "current stage"},
  "educationalElements": ["learning objective if applicable"],
  "ageAppropriateness": "${targetAge}",
  "readingLevel": "${getAgeReadingLevel(targetAge)}"
}${contextPrompt}`;
}

/**
 * Gets genre-specific instructions and safety guidelines
 */
function getGenreInstructions(genre: string): string {
  const instructions = {
    'fantasy-magic': `FANTASY & MAGIC ADVENTURE GUIDELINES:
- Create whimsical, adventurous tales with friendly magic and mythical creatures
- All magic should be used for helping others and solving problems with kindness
- Dragons, unicorns, and magical beings should be friendly and helpful
- Focus on wonder, imagination, and positive magical solutions
- Use vivid, colorful descriptions of magical worlds and creatures
- Promote values of bravery, kindness, and cooperation through magical adventures`,

    'educational-stories': `EDUCATIONAL STORY GUIDELINES:
- Weave learning naturally into engaging narrative adventures
- Present facts through character discoveries and hands-on exploration
- Use simple explanations and analogies children can understand
- Make learning feel like an exciting adventure, not a lecture
- Include curious characters who ask questions and explore topics
- Focus on STEM, history, nature, or social skills in age-appropriate ways`,

    'mystery-detective': `MYSTERY & DETECTIVE GUIDELINES:
- Create fun, light-hearted mysteries with kid-friendly puzzles to solve
- Focus on harmless mysteries like missing pets, secret notes, or friendly pranks
- Use investigative language that encourages logical thinking
- Include clues that children can understand and follow along with
- Ensure all "spooky" elements are revealed as friendly and safe
- Promote problem-solving, observation skills, and teamwork`,

    'silly-humor': `SILLY & HUMOROUS STORY GUIDELINES:
- Create laugh-out-loud funny situations with gentle, positive humor
- Use silly character antics, funny misunderstandings, and harmless slapstick
- Include sound effects and exaggerated descriptions for comedy
- Ensure all humor is kind and characters laugh together, not at each other
- Create absurd but delightful situations that make children giggle
- Use wordplay and funny dialogue appropriate for young audiences`,

    'bedtime-stories': `BEDTIME STORY GUIDELINES:
- Create gentle, soothing narratives that help children wind down for sleep
- Use soft, calming language with peaceful imagery and quiet voices
- Focus on themes of safety, comfort, love, and peaceful resolution
- Avoid excitement, loud sounds, or stimulating content
- Include cozy settings like warm beds, starry skies, and gentle friends
- End segments peacefully with reassuring, sleep-promoting content`,

    'science-space': `SCIENCE FICTION & SPACE GUIDELINES:
- Create wonder-filled space adventures with friendly aliens and helpful technology
- Present science concepts as magical and exciting, not intimidating
- Include curious young explorers learning about space, planets, and technology
- Show all technology as beneficial and designed to help people
- Focus on wonder, discovery, and positive scientific exploration
- Make the future seem bright, optimistic, and full of possibilities`,

    'values-lessons': `VALUES & LIFE LESSONS GUIDELINES:
- Create stories that naturally teach important character values and morals
- Show characters making good choices and learning from mistakes with forgiveness
- Focus on empathy, kindness, honesty, courage, and friendship
- Present moral lessons through character actions, not preaching
- Include relatable situations children might face in their own lives
- Help children feel confident about making good, kind choices`,

    'adventure-exploration': `ADVENTURE & EXPLORATION GUIDELINES:
- Create exciting but safe adventures with positive outcomes
- Focus on discovery, teamwork, and helping others through exploration
- Include friendly encounters with people from different places or cultures
- Promote curiosity, bravery, and friendship through adventure
- Ensure all adventures are age-appropriate with no real danger
- Use vivid descriptions of amazing places and exciting discoveries`
  };

  return instructions[genre as keyof typeof instructions] || instructions['fantasy-magic'];
}

/**
 * Creates a user prompt for story continuation
 */
export function buildUserPrompt(
  initialPrompt?: string,
  choiceText?: string,
  storyMode?: string
): string {
  if (initialPrompt) {
    return `Start a new safe, educational ${storyMode || 'fantasy'} story appropriate for children: "${initialPrompt}"`;
  } else {
    return `Continue the story safely and appropriately. User chose: "${choiceText}"`;
  }
}

/**
 * Enhances image prompts with genre-appropriate descriptors and safety measures
 */
export function enhanceImagePrompt(basePrompt: string, genre: string): string {
  const safetyDescriptors = 'child-friendly, colorful, bright, cheerful, cartoon style, children\'s book illustration';
  const genreEnhancements = getGenreImageEnhancements(genre);
  
  return `${basePrompt}, ${genreEnhancements}, ${safetyDescriptors}`;
}

/**
 * Gets genre-specific image prompt enhancements
 */
function getGenreImageEnhancements(genre: string): string {
  const enhancements = {
    'fantasy-magic': 'whimsical, magical, friendly creatures, bright colors, sparkles',
    'educational-stories': 'educational, clear, informative, engaging diagrams',
    'mystery-detective': 'cute detective theme, magnifying glass, friendly mystery',
    'silly-humor': 'funny, exaggerated expressions, dynamic, comic style',
    'bedtime-stories': 'soft, dreamy, gentle lighting, soothing pastels',
    'science-space': 'friendly space adventure, cute robots, bright planets',
    'values-lessons': 'heartwarming, diverse characters, positive interactions',
    'adventure-exploration': 'exciting but safe, beautiful landscapes, friendly encounters'
  };

  return enhancements[genre as keyof typeof enhancements] || enhancements['fantasy-magic'];
}

/**
 * Gets age-specific instructions for content generation
 */
function getAgeSpecificInstructions(targetAge: '4-6' | '7-9' | '10-12'): string {
  const instructions = {
    '4-6': `AGE 4-6 SPECIFIC REQUIREMENTS:
- Use very simple vocabulary with 3-8 words per sentence maximum
- Keep total story length between 50-200 words
- Use repetitive patterns and familiar concepts
- Focus on basic emotions: happy, sad, scared, excited
- Include bright colors, friendly animals, and familiar objects
- Use simple cause-and-effect relationships
- Avoid complex concepts or abstract thinking
- Include gentle humor and positive reinforcement
- Use short, clear sentences with basic punctuation
- Focus on comfort, security, and simple problem-solving`,

    '7-9': `AGE 7-9 SPECIFIC REQUIREMENTS:
- Use elementary vocabulary with 5-12 words per sentence
- Keep total story length between 150-400 words
- Include basic problem-solving and friendship themes
- Introduce simple scientific concepts and curiosity
- Use descriptive language but keep it accessible
- Include character development and moral lessons
- Balance adventure with safety and positive outcomes
- Use dialogue to advance the story and show character
- Include educational elements naturally woven into plot
- Focus on cooperation, empathy, and learning`,

    '10-12': `AGE 10-12 SPECIFIC REQUIREMENTS:
- Use intermediate vocabulary with 8-15 words per sentence
- Keep total story length between 300-600 words
- Include more complex plots and character development
- Introduce STEM concepts and critical thinking
- Use varied sentence structures and descriptive language
- Include moral complexity and ethical decision-making
- Balance excitement with age-appropriate challenges
- Use sophisticated dialogue and character interactions
- Include educational content that challenges and engages
- Focus on personal growth, leadership, and social skills`
  };

  return instructions[targetAge];
}

/**
 * Gets age-appropriate word count for story segments
 */
function getAgeAppropriateWordCount(targetAge: '4-6' | '7-9' | '10-12'): string {
  const wordCounts = {
    '4-6': '50-150',
    '7-9': '150-300',
    '10-12': '300-500'
  };
  return wordCounts[targetAge];
}

/**
 * Gets age-appropriate reading level
 */
function getAgeReadingLevel(targetAge: '4-6' | '7-9' | '10-12'): string {
  const readingLevels = {
    '4-6': 'beginner',
    '7-9': 'intermediate',
    '10-12': 'advanced'
  };
  return readingLevels[targetAge];
}

/**
 * Creates a comprehensive negative prompt for safe image generation
 */
export function createSafeNegativePrompt(): string {
  return [
    'violence', 'weapons', 'blood', 'gore', 'scary', 'frightening', 'dark atmosphere',
    'monsters', 'demons', 'horror', 'nudity', 'explicit', 'mature content',
    'realistic violence', 'dangerous situations', 'mean expressions',
    'text overlays', 'watermarks', 'low quality', 'blurry', 'distorted'
  ].join(', ');
} 

// Enhanced prompt generation with narrative continuity
export function generateEnhancedPromptWithContinuity(
  genre: string,
  userInput: string,
  storyContext?: StoryContext,
  previousChapters?: string[]
): string {
  // Initialize narrative continuity engine
  let continuityEngine: NarrativeContinuityEngine;
  
  if (previousChapters && previousChapters.length > 0) {
    // Initialize from first chapter if no context provided
    const initialContext = initializeStoryContext(previousChapters[0], genre);
    continuityEngine = new NarrativeContinuityEngine(initialContext);
    
    // Update context with all previous chapters
    previousChapters.slice(1).forEach((chapter, index) => {
      continuityEngine.updateStoryContext(chapter, {});
    });
  } else {
    // New story - create fresh context
    continuityEngine = new NarrativeContinuityEngine();
  }

  // Get base genre template
  const baseTemplate = getGenrePromptTemplate(genre);
  
  // Generate continuity-aware prompt
  const continuityPrompt = continuityEngine.generateContinuityPrompt(genre, userInput);
  
  // Combine genre-specific template with continuity requirements
  const enhancedPrompt = `
${baseTemplate.safetyInstructions.join('\n')}

${baseTemplate.educationalGoals.join('\n')}

NARRATIVE CONTINUITY SYSTEM:
${continuityPrompt}

STORY GENERATION REQUIREMENTS:
- Vocabulary Level: ${baseTemplate.vocabularyLevel}
- Conflict Resolution Style: ${baseTemplate.conflictResolution}
- Required Character Traits: ${baseTemplate.characterTraits.join(', ')}
- Educational Integration: ${baseTemplate.educationalIntegration}

AGE-APPROPRIATE GUIDELINES:
- Ages 4-6: ${baseTemplate.ageSpecificGuidelines['4-6']}
- Ages 7-9: ${baseTemplate.ageSpecificGuidelines['7-9']}
- Ages 10-12: ${baseTemplate.ageSpecificGuidelines['10-12']}

QUALITY STANDARDS:
- Maintain character consistency across chapters
- Ensure logical plot progression
- Include clear scene transitions
- Reference previous events when relevant
- Build toward satisfying story resolution

Generate the next chapter following these guidelines while maintaining perfect narrative continuity.
`;

  return enhancedPrompt;
}

// Enhanced genre-specific templates with continuity considerations
interface ContinuityGenreTemplate {
  safetyInstructions: string[];
  educationalGoals: string[];
  vocabularyLevel: 'simple' | 'intermediate' | 'advanced';
  conflictResolution: 'cooperation' | 'problem-solving' | 'gentle-guidance';
  characterTraits: string[];
  educationalIntegration: string;
  ageSpecificGuidelines: {
    '4-6': string;
    '7-9': string;
    '10-12': string;
  };
  continuityChallenges: string[];
  commonPlotThreads: string[];
}

export function getGenrePromptTemplate(genre: string): ContinuityGenreTemplate {
  const templates: { [key: string]: ContinuityGenreTemplate } = {
    'fantasy-magic': {
      safetyInstructions: [
        'All magical creatures must be friendly and helpful',
        'Magic is used for positive purposes like helping friends and solving problems',
        'Conflicts resolved through cooperation and understanding, never violence',
        'No dark magic, scary transformations, or frightening supernatural elements',
        'Magical worlds are welcoming and safe spaces for exploration'
      ],
      educationalGoals: [
        'Encourage creative problem-solving through magical scenarios',
        'Build vocabulary through rich, descriptive magical language',
        'Introduce basic cause-and-effect concepts through magical consequences',
        'Develop imagination and creative thinking skills',
        'Teach cooperation through magical teamwork adventures'
      ],
      vocabularyLevel: 'intermediate',
      conflictResolution: 'cooperation',
      characterTraits: ['helpful', 'creative', 'brave', 'kind', 'curious'],
      educationalIntegration: 'Natural integration of learning through magical discoveries and cooperative problem-solving',
      ageSpecificGuidelines: {
        '4-6': 'Simple magic that is easy to understand, friendly magical creatures, clear good vs. helpful distinctions',
        '7-9': 'More complex magical systems, magical problem-solving, introduction to magical consequences',
        '10-12': 'Sophisticated magical worlds, ethical use of magic, complex magical relationships and responsibilities'
      },
      continuityChallenges: [
        'Keep track of magical abilities and their limitations',
        'Maintain consistency in magical world rules',
        'Ensure all characters participate in magical adventures',
        'Progress magical learning and character growth'
      ],
      commonPlotThreads: [
        'Learning to use new magical abilities responsibly',
        'Helping magical creatures with problems',
        'Discovering hidden magical places',
        'Working together to overcome magical challenges'
      ]
    },

    'educational-adventure': {
      safetyInstructions: [
        'All learning adventures are safe and age-appropriate',
        'Scientific concepts presented accurately but simply',
        'Characters learn together as a team, supporting each other',
        'Mistakes are learning opportunities, never causes for shame',
        'Real-world applications connect to children\'s experiences'
      ],
      educationalGoals: [
        'Integrate STEM concepts naturally into adventure narratives',
        'Encourage scientific curiosity and observation skills',
        'Teach research methods and critical thinking appropriate for age',
        'Connect learning to real-world applications and experiences',
        'Build confidence in academic subjects through story success'
      ],
      vocabularyLevel: 'intermediate',
      conflictResolution: 'problem-solving',
      characterTraits: ['curious', 'observant', 'persistent', 'collaborative', 'enthusiastic'],
      educationalIntegration: 'STEM concepts emerge naturally from adventure scenarios with hands-on discovery learning',
      ageSpecificGuidelines: {
        '4-6': 'Basic concepts through sensory exploration, simple cause-and-effect, pattern recognition',
        '7-9': 'Elementary scientific method, basic research, simple experiments and observations',
        '10-12': 'More complex scientific reasoning, hypothesis testing, understanding systems and relationships'
      },
      continuityChallenges: [
        'Maintain educational progression across chapters',
        'Keep scientific concepts age-appropriate and accurate',
        'Ensure all characters contribute to learning discoveries',
        'Build on previous learning in subsequent chapters'
      ],
      commonPlotThreads: [
        'Solving mysteries through scientific observation',
        'Discovering how things work in the natural world',
        'Conducting simple experiments to test ideas',
        'Learning from nature and scientific exploration'
      ]
    },

    'mystery-detective': {
      safetyInstructions: [
        'All mysteries are kid-friendly puzzles with no real danger',
        'Focus on observation skills and logical thinking',
        'Characters work together to solve puzzles cooperatively',
        'No frightening elements or threatening situations',
        'Solutions always make logical sense and teach problem-solving'
      ],
      educationalGoals: [
        'Develop critical thinking and deductive reasoning skills',
        'Encourage careful observation and attention to detail',
        'Teach logical problem-solving approaches',
        'Build confidence in analytical thinking abilities',
        'Introduce concepts of evidence and logical conclusions'
      ],
      vocabularyLevel: 'intermediate',
      conflictResolution: 'problem-solving',
      characterTraits: ['observant', 'logical', 'patient', 'detail-oriented', 'collaborative'],
      educationalIntegration: 'Logic and reasoning skills developed through engaging mystery-solving adventures',
      ageSpecificGuidelines: {
        '4-6': 'Simple visual clues, obvious patterns, straightforward cause-and-effect mysteries',
        '7-9': 'Multi-step puzzles, logical reasoning chains, pattern recognition challenges',
        '10-12': 'Complex deductive reasoning, multiple clues integration, sophisticated problem-solving strategies'
      },
      continuityChallenges: [
        'Maintain clue consistency across chapters',
        'Ensure mystery progression makes logical sense',
        'Keep all characters involved in investigation',
        'Build toward satisfying and logical resolution'
      ],
      commonPlotThreads: [
        'Following clues to solve engaging puzzles',
        'Using observation skills to discover solutions',
        'Working as a team to piece together mysteries',
        'Learning from mistakes to improve detective skills'
      ]
    },

    'bedtime-stories': {
      safetyInstructions: [
        'All content promotes calm, peaceful feelings',
        'No exciting or stimulating events that could prevent sleep',
        'Gentle resolutions to any minor conflicts',
        'Soothing, rhythmic language patterns',
        'Reassuring themes of safety, comfort, and security'
      ],
      educationalGoals: [
        'Promote emotional regulation and peaceful feelings',
        'Reinforce feelings of safety and security',
        'Introduce gentle life lessons through calm scenarios',
        'Develop vocabulary through soothing, descriptive language',
        'Support healthy bedtime routines and associations'
      ],
      vocabularyLevel: 'simple',
      conflictResolution: 'gentle-guidance',
      characterTraits: ['gentle', 'caring', 'peaceful', 'wise', 'comforting'],
      educationalIntegration: 'Gentle life lessons and emotional learning woven into calming bedtime narratives',
      ageSpecificGuidelines: {
        '4-6': 'Very simple, repetitive language, familiar settings, immediate comfort and resolution',
        '7-9': 'Slightly longer stories with gentle progression, familiar characters, peaceful resolutions',
        '10-12': 'More sophisticated but still calming narratives, deeper emotional themes, restful conclusions'
      },
      continuityChallenges: [
        'Maintain consistently calm and peaceful tone',
        'Ensure story progression doesn\'t become too exciting',
        'Keep characters in safe, comfortable situations',
        'Build toward restful, satisfying conclusions'
      ],
      commonPlotThreads: [
        'Gentle adventures that end in peaceful resolution',
        'Comforting friendships and caring relationships',
        'Quiet discoveries and gentle learning moments',
        'Safe exploration that leads to restful endings'
      ]
    }

    // Additional genre templates would follow the same pattern...
  };

  return templates[genre] || templates['fantasy-magic']; // Default fallback
}

// Function to extract and validate story continuity
export function validateStoryContinuity(
  genre: string,
  previousChapters: string[],
  proposedNextChapter: string
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  if (previousChapters.length === 0) {
    return { isValid: true, issues: [], suggestions: [] };
  }

  const issues: string[] = [];
  const suggestions: string[] = [];

  // Initialize continuity engine from previous chapters
  const initialContext = initializeStoryContext(previousChapters[0], genre);
  const continuityEngine = new NarrativeContinuityEngine(initialContext);

  // Update with all previous chapters
  previousChapters.slice(1).forEach(chapter => {
    continuityEngine.updateStoryContext(chapter, {});
  });

  // Validate proposed next chapter
  const consistencyCheck = continuityEngine.validateNarrativeConsistency();
  
  if (!consistencyCheck.isValid) {
    issues.push(...consistencyCheck.issues);
  }
  
  suggestions.push(...consistencyCheck.suggestions);

  // Additional validation checks
  const previousCharacters = extractMentionedCharacters(previousChapters.join(' '));
  const newCharacters = extractMentionedCharacters(proposedNextChapter);
  
  // Check for character continuity
  const missingCharacters = previousCharacters.filter(char => 
    !newCharacters.includes(char) && 
    previousChapters[previousChapters.length - 1].includes(char)
  );

  if (missingCharacters.length > 0) {
    issues.push(`Missing characters from previous chapter: ${missingCharacters.join(', ')}`);
    suggestions.push(`Consider mentioning what happened to: ${missingCharacters.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

function extractMentionedCharacters(text: string): string[] {
  // Simple character extraction - would be more sophisticated in production
  const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const characterNames = words.filter((word, index, array) => 
    array.indexOf(word) !== index && // Appears more than once
    word.length > 2 &&
    !['The', 'They', 'She', 'He', 'It', 'There', 'This', 'That', 'And', 'But', 'When', 'Then'].includes(word)
  );
  
  return [...new Set(characterNames)]; // Remove duplicates
} 