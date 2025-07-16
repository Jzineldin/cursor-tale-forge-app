/**
 * Content Safety Utilities for Tale-Forge Backend
 * Ensures all generated content is safe and age-appropriate for children ages 4-12
 */

// Unsafe keywords to detect and filter
const UNSAFE_KEYWORDS = [
  // Violence and weapons
  'kill', 'murder', 'blood', 'gore', 'weapon', 'gun', 'knife', 'sword', 'fight', 'battle',
  'war', 'death', 'die', 'dead', 'attack', 'shoot', 'stab', 'hurt', 'pain', 'wound',
  
  // Scary content
  'horror', 'terrifying', 'nightmare', 'demon', 'evil', 'creepy', 'scary', 'frightening',
  'ghost', 'haunted', 'zombie', 'vampire', 'curse', 'devil', 'hell',
  
  // Mature content
  'sexy', 'sexual', 'adult', 'explicit', 'nude', 'naked', 'romantic', 'kiss', 'intimate',
  
  // Negative language
  'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'fat', 'loser', 'worthless', 'pathetic',
  
  // Substances
  'alcohol', 'drunk', 'drug', 'smoke', 'poison', 'toxic'
];

const POSITIVE_REPLACEMENTS: Record<string, string> = {
  'fight': 'work together',
  'battle': 'friendly competition',
  'weapon': 'tool',
  'scary': 'mysterious',
  'evil': 'confused',
  'monster': 'creature',
  'hate': 'dislike',
  'stupid': 'learning',
  'ugly': 'unique'
};

export interface ContentSafetyResult {
  isSafe: boolean;
  violations: string[];
  sanitizedText?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Validates content for child safety
 */
export function validateContentSafety(text: string): ContentSafetyResult {
  const violations: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for unsafe keywords
  UNSAFE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      violations.push(keyword);
    }
  });
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (violations.length > 0) {
    riskLevel = violations.length > 3 ? 'high' : 'medium';
  }
  
  return {
    isSafe: violations.length === 0,
    violations,
    sanitizedText: violations.length > 0 ? sanitizeContent(text) : undefined,
    riskLevel
  };
}

/**
 * Sanitizes content by replacing unsafe terms with safe alternatives
 */
function sanitizeContent(text: string): string {
  let sanitized = text;
  
  // Replace unsafe terms with positive alternatives
  Object.entries(POSITIVE_REPLACEMENTS).forEach(([unsafe, safe]) => {
    const regex = new RegExp(`\\b${unsafe}\\b`, 'gi');
    sanitized = sanitized.replace(regex, safe);
  });
  
  // Remove any remaining unsafe keywords
  UNSAFE_KEYWORDS.forEach(keyword => {
    if (!POSITIVE_REPLACEMENTS[keyword]) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }
  });
  
  // Clean up extra spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Validates user input before processing
 */
export function validateUserInput(input: string): ContentSafetyResult {
  const safetyCheck = validateContentSafety(input);
  
  // Additional user input checks
  if (input.length > 500) {
    safetyCheck.violations.push('Input too long');
    safetyCheck.isSafe = false;
  }
  
  // Check for random characters or nonsense
  const nonsensePattern = /[!@#$%^&*()_+=\[\]{}|;':",./<>?~`]{3,}/;
  if (nonsensePattern.test(input)) {
    safetyCheck.violations.push('Invalid characters');
    safetyCheck.isSafe = false;
  }
  
  return safetyCheck;
}

/**
 * Validates and enhances image prompts for safety
 */
export function validateImagePrompt(prompt: string): string {
  const safetyCheck = validateContentSafety(prompt);
  
  let safePrompt = safetyCheck.isSafe ? prompt : (safetyCheck.sanitizedText || prompt);
  
  // Add positive descriptors if not present
  const positiveDescriptors = ['cheerful', 'friendly', 'colorful', 'bright', 'happy', 'cute'];
  const hasPositive = positiveDescriptors.some(desc => 
    safePrompt.toLowerCase().includes(desc)
  );
  
  if (!hasPositive) {
    safePrompt = `${safePrompt}, cheerful and colorful`;
  }
  
  // Ensure child-friendly style
  if (!safePrompt.toLowerCase().includes('children') && !safePrompt.toLowerCase().includes('cartoon')) {
    safePrompt = `${safePrompt}, children's book illustration style`;
  }
  
  return safePrompt;
}

/**
 * Applies safety filter to complete story response
 */
export function applySafetyFilter(response: any): any {
  const safeResponse = { ...response };
  
  // Validate story text
  if (safeResponse.segmentText) {
    const textSafety = validateContentSafety(safeResponse.segmentText);
    if (!textSafety.isSafe) {
      console.warn('Story text safety violation:', textSafety.violations);
      safeResponse.segmentText = textSafety.sanitizedText || safeResponse.segmentText;
    }
  }
  
  // Validate choices
  if (safeResponse.choices && Array.isArray(safeResponse.choices)) {
    safeResponse.choices = safeResponse.choices.map((choice: string) => {
      const choiceSafety = validateContentSafety(choice);
      return choiceSafety.isSafe ? choice : (choiceSafety.sanitizedText || choice);
    });
  }
  
  // Validate image prompt
  if (safeResponse.imagePrompt) {
    safeResponse.imagePrompt = validateImagePrompt(safeResponse.imagePrompt);
  }
  
  // Add safety metadata
  safeResponse.safetyChecked = true;
  safeResponse.safetyTimestamp = new Date().toISOString();
  
  return safeResponse;
}

/**
 * Emergency safety check for final output
 */
export function emergencySafetyCheck(content: string): boolean {
  const criticalUnsafeTerms = [
    'kill', 'murder', 'blood', 'death', 'weapon', 'gun', 'knife',
    'sexual', 'nude', 'explicit', 'horror', 'terrifying'
  ];
  
  const lowerContent = content.toLowerCase();
  return !criticalUnsafeTerms.some(term => lowerContent.includes(term));
}

/**
 * Creates safe negative prompt for image generation
 */
export function createSafeNegativePrompt(): string {
  return [
    'violence', 'weapons', 'blood', 'gore', 'scary', 'horror', 'dark',
    'nudity', 'explicit', 'mature', 'frightening', 'demons', 'monsters',
    'realistic violence', 'dangerous', 'text', 'watermarks', 'blurry'
  ].join(', ');
} 