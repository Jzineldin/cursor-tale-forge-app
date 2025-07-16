/**
 * Content Safety Utilities for Tale-Forge
 * Ensures all generated content is safe and age-appropriate for children ages 4-12
 */

// Disallowed content categories and keywords
const UNSAFE_KEYWORDS = {
  violence: [
    'kill', 'murder', 'blood', 'gore', 'weapon', 'gun', 'knife', 'sword', 'fight', 'battle',
    'war', 'death', 'die', 'dead', 'corpse', 'wound', 'injury', 'hurt', 'pain', 'attack',
    'stab', 'shoot', 'punch', 'kick', 'hit', 'slap', 'beat', 'torture', 'suffer'
  ],
  mature: [
    'sexy', 'sexual', 'adult', 'mature', 'inappropriate', 'explicit', 'nude', 'naked',
    'romance', 'kiss', 'love affair', 'passion', 'intimate', 'sensual'
  ],
  scary: [
    'horror', 'terrifying', 'nightmare', 'monster', 'demon', 'evil', 'dark', 'creepy',
    'scary', 'frightening', 'ghost', 'haunted', 'zombie', 'vampire', 'witch', 'curse',
    'spell', 'black magic', 'devil', 'satan', 'hell'
  ],
  negative: [
    'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'fat', 'loser', 'failure', 'worthless',
    'useless', 'pathetic', 'disgusting', 'gross', 'nasty', 'awful', 'terrible'
  ],
  substances: [
    'alcohol', 'beer', 'wine', 'drunk', 'drug', 'smoke', 'cigarette', 'tobacco',
    'poison', 'toxic', 'dangerous chemicals'
  ]
};

const POSITIVE_ALTERNATIVES: Record<string, string> = {
  'fight': 'work together to solve the problem',
  'battle': 'friendly competition',
  'weapon': 'tool to help others',
  'monster': 'misunderstood creature',
  'scary': 'mysterious but friendly',
  'evil': 'confused and needs help',
  'dark': 'cozy and peaceful',
  'hate': 'dislike',
  'stupid': 'learning',
  'ugly': 'unique and special',
  'kill': 'stop gently',
  'death': 'long sleep',
  'die': 'go away safely'
};

export interface ContentSafetyResult {
  isSafe: boolean;
  violations: string[];
  suggestions: string[];
  sanitizedText?: string | undefined;
}

export interface AgeAppropriatenessCheck {
  targetAge: '4-6' | '7-9' | '10-12';
  isAppropriate: boolean;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  concerns: string[];
}

/**
 * Checks if content is safe for children
 */
export function checkContentSafety(text: string): ContentSafetyResult {
  const violations: string[] = [];
  const suggestions: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for unsafe keywords
  Object.entries(UNSAFE_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        violations.push(`${category}: "${keyword}"`);
        
        // Suggest alternatives where available
        if (POSITIVE_ALTERNATIVES[keyword]) {
          suggestions.push(`Replace "${keyword}" with "${POSITIVE_ALTERNATIVES[keyword]}"`);
        } else {
          suggestions.push(`Remove or replace "${keyword}" with child-friendly language`);
        }
      }
    });
  });

  // Check for complex sentence structures that might be too advanced
  const sentences = text.split(/[.!?]+/);
  const longSentences = sentences.filter(s => s.split(' ').length > 15);
  if (longSentences.length > 0) {
    suggestions.push('Consider breaking down longer sentences for better readability');
  }

  // Check for appropriate vocabulary level
  const complexWords = ['sophisticated', 'elaborate', 'magnificent', 'extraordinary', 'demonstrate'];
  complexWords.forEach(word => {
    if (lowerText.includes(word)) {
      suggestions.push(`Consider simpler alternatives to "${word}"`);
    }
  });

  return {
    isSafe: violations.length === 0,
    violations,
    suggestions,
    sanitizedText: violations.length > 0 ? sanitizeText(text) : undefined
  };
}

/**
 * Sanitizes text by replacing unsafe content with safe alternatives
 */
export function sanitizeText(text: string): string {
  let sanitizedText = text;

  // Replace unsafe keywords with positive alternatives
  Object.entries(POSITIVE_ALTERNATIVES).forEach(([unsafe, safe]) => {
    const regex = new RegExp(`\\b${unsafe}\\b`, 'gi');
    sanitizedText = sanitizedText.replace(regex, safe);
  });

  // Remove or replace any remaining unsafe content
  Object.values(UNSAFE_KEYWORDS).flat().forEach(keyword => {
    if (!POSITIVE_ALTERNATIVES[keyword]) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitizedText = sanitizedText.replace(regex, '');
    }
  });

  // Clean up any double spaces or punctuation issues
  sanitizedText = sanitizedText.replace(/\s+/g, ' ').trim();
  
  return sanitizedText;
}

/**
 * Validates user input for safety before using in story generation
 */
export function validateUserInput(input: string): ContentSafetyResult {
  const result = checkContentSafety(input);
  
  // Additional checks for user input
  const trimmedInput = input.trim();
  
  // Check for inappropriate length
  if (trimmedInput.length > 500) {
    result.suggestions.push('Please keep your input shorter and more focused');
  }
  
  // Check for nonsense or random characters
  const nonsensePattern = /[!@#$%^&*()_+=\[\]{}|;':",./<>?~`]{3,}/;
  if (nonsensePattern.test(trimmedInput)) {
    result.violations.push('Invalid characters detected');
    result.isSafe = false;
  }

  return result;
}

/**
 * Checks age appropriateness of content
 */
export function checkAgeAppropriateness(text: string, targetAge: '4-6' | '7-9' | '10-12'): AgeAppropriatenessCheck {
  const concerns: string[] = [];
  const wordCount = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / sentences.length;

  // Reading level assessment
  let readingLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  
  if (targetAge === '4-6') {
    if (avgWordsPerSentence > 8) {
      concerns.push('Sentences may be too long for this age group');
    }
    if (wordCount > 100) {
      concerns.push('Text may be too long for attention span');
    }
    readingLevel = 'beginner';
  } else if (targetAge === '7-9') {
    if (avgWordsPerSentence > 12) {
      concerns.push('Consider shorter sentences for better comprehension');
    }
    if (wordCount > 150) {
      concerns.push('Text length is at the upper limit for this age group');
    }
    readingLevel = avgWordsPerSentence > 10 ? 'intermediate' : 'beginner';
  } else { // 10-12
    if (avgWordsPerSentence > 15) {
      concerns.push('Very complex sentences detected');
    }
    readingLevel = avgWordsPerSentence > 12 ? 'advanced' : 'intermediate';
  }

  // Check for age-appropriate themes
  const text_lower = text.toLowerCase();
  const matureThemes = ['romantic relationship', 'dating', 'kissing', 'growing up', 'teenager'];
  matureThemes.forEach(theme => {
    if (text_lower.includes(theme) && targetAge === '4-6') {
      concerns.push(`Theme "${theme}" may be too mature for this age group`);
    }
  });

  return {
    targetAge,
    isAppropriate: concerns.length === 0,
    readingLevel,
    concerns
  };
}

/**
 * Validates image prompts for safety
 */
export function validateImagePrompt(prompt: string): ContentSafetyResult {
  const result = checkContentSafety(prompt);
  
  // Additional image-specific safety checks
  const imageUnsafeKeywords = [
    'realistic', 'photorealistic', 'nude', 'naked', 'weapon', 'violence',
    'scary face', 'monster face', 'dark atmosphere', 'horror style',
    'blood', 'gore', 'explicit', 'mature', 'adult content'
  ];

  imageUnsafeKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword)) {
      result.violations.push(`Image safety: "${keyword}"`);
      result.isSafe = false;
    }
  });

  // Ensure positive, child-friendly descriptors
  const requiredPositiveTerms = ['friendly', 'cheerful', 'colorful', 'bright', 'happy', 'cute', 'cartoon'];
  const hasPositiveTerm = requiredPositiveTerms.some(term => 
    prompt.toLowerCase().includes(term)
  );

  if (!hasPositiveTerm) {
    result.suggestions.push('Add positive descriptors like "cheerful", "colorful", or "friendly"');
  }

  return result;
}

/**
 * Creates a safe negative prompt for image generation
 */
export function createSafeNegativePrompt(): string {
  return [
    'violence', 'blood', 'gore', 'weapons', 'scary imagery', 'horror',
    'nudity', 'explicit content', 'mature themes', 'dark atmosphere',
    'realistic violence', 'frightening faces', 'monsters', 'demons',
    'text overlays', 'watermarks', 'low quality', 'blurry', 'ugly',
    'distorted faces', 'extra limbs', 'deformed'
  ].join(', ');
}

/**
 * Emergency content filter for final output validation
 */
export function finalContentCheck(content: {
  segmentText: string;
  choices: string[];
  imagePrompt?: string | undefined;
}): ContentSafetyResult {
  const allText = [
    content.segmentText,
    ...content.choices,
    content.imagePrompt || ''
  ].join(' ');

  const result = checkContentSafety(allText);
  
  // Additional final checks
  if (content.choices.some(choice => choice.length > 100)) {
    result.suggestions.push('Some choices are too long');
  }

  if (!content.segmentText || content.segmentText.length < 50) {
    result.violations.push('Story segment too short');
    result.isSafe = false;
  }

  return result;
}

/**
 * Content safety middleware for API responses
 */
export function applySafetyFilter<T extends { segmentText?: string; choices?: string[]; imagePrompt?: string }>(
  response: T
): T & { safetyCheck: ContentSafetyResult } {
  const safetyCheck = finalContentCheck({
    segmentText: response.segmentText || '',
    choices: response.choices || [],
    imagePrompt: response.imagePrompt
  });

  // If content is unsafe, sanitize it
  if (!safetyCheck.isSafe && response.segmentText) {
    response.segmentText = sanitizeText(response.segmentText);
    if (response.choices) {
      response.choices = response.choices.map(choice => sanitizeText(choice));
    }
    if (response.imagePrompt) {
      response.imagePrompt = sanitizeText(response.imagePrompt);
    }
  }

  return {
    ...response,
    safetyCheck
  };
} 