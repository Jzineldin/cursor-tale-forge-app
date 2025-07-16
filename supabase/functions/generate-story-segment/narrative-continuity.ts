// Narrative Continuity System for TaleForge
// Ensures logical story progression and character consistency across chapters

export interface StoryContext {
  currentChapter: number;
  characters: CharacterState[];
  locations: LocationState[];
  plotThreads: PlotThread[];
  previousEvents: StoryEvent[];
  openQuestions: string[];
  narrativeGoals: string[];
}

export interface CharacterState {
  name: string;
  currentLocation: string;
  emotionalState: string;
  abilities: string[];
  relationships: { [characterName: string]: string };
  lastSeenChapter: number;
  isActive: boolean;
}

export interface LocationState {
  name: string;
  description: string;
  connectedLocations: string[];
  charactersPresent: string[];
  importantObjects: string[];
  atmosphere: string;
}

export interface PlotThread {
  id: string;
  description: string;
  status: 'active' | 'resolved' | 'dormant';
  introducedChapter: number;
  expectedResolution: string;
  relatedCharacters: string[];
}

export interface StoryEvent {
  chapter: number;
  description: string;
  charactersInvolved: string[];
  location: string;
  consequences: string[];
  unresolved: boolean;
}

export interface TransitionRequirement {
  fromLocation: string;
  toLocation: string;
  method: string;
  duration: string;
  charactersInvolved: string[];
  explanation: string;
}

export class NarrativeContinuityEngine {
  private storyContext: StoryContext;

  constructor(initialContext?: Partial<StoryContext>) {
    this.storyContext = {
      currentChapter: 1,
      characters: [],
      locations: [],
      plotThreads: [],
      previousEvents: [],
      openQuestions: [],
      narrativeGoals: [],
      ...initialContext
    };
  }

  // Validate story consistency before generating next chapter
  validateNarrativeConsistency(): ConsistencyCheck {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check character locations
    this.storyContext.characters.forEach(character => {
      if (character.isActive && !this.isCharacterLocationValid(character)) {
        issues.push(`Character ${character.name} location is unclear or inconsistent`);
      }
      
      if (character.isActive && character.lastSeenChapter < this.storyContext.currentChapter - 1) {
        warnings.push(`Character ${character.name} hasn't appeared recently - consider reintroducing`);
      }
    });

    // Check plot thread progression
    const activeThreads = this.storyContext.plotThreads.filter(thread => thread.status === 'active');
    if (activeThreads.length === 0 && this.storyContext.currentChapter > 1) {
      warnings.push('No active plot threads - story may lack direction');
    }

    // Check for unresolved events
    const unresolvedEvents = this.storyContext.previousEvents.filter(event => event.unresolved);
    if (unresolvedEvents.length > 3) {
      issues.push('Too many unresolved plot points - story becoming confusing');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      suggestions: this.generateSuggestions()
    };
  }

  // Generate continuity-aware prompts for next chapter
  generateContinuityPrompt(genre: string, userInput: string): string {
    const consistency = this.validateNarrativeConsistency();
    const activeCharacters = this.getActiveCharacters();
    const currentLocation = this.getCurrentLocation();
    const activeThreads = this.getActivePlotThreads();

    let prompt = `Continue this ${genre} story with strong narrative continuity.\n\n`;
    
    // Context from previous chapter
    prompt += `STORY CONTEXT:\n`;
    prompt += `- Current Chapter: ${this.storyContext.currentChapter}\n`;
    prompt += `- Active Characters: ${activeCharacters.map(c => `${c.name} (at ${c.currentLocation}, feeling ${c.emotionalState})`).join(', ')}\n`;
    prompt += `- Current Location: ${currentLocation?.name || 'Unknown'}\n`;
    prompt += `- Active Plot Threads: ${activeThreads.map(t => t.description).join('; ')}\n\n`;

    // Previous chapter summary
    if (this.storyContext.previousEvents.length > 0) {
      const lastEvent = this.storyContext.previousEvents[this.storyContext.previousEvents.length - 1];
      prompt += `PREVIOUS CHAPTER ENDED WITH: ${lastEvent.description}\n\n`;
    }

    // Continuity requirements
    prompt += `CONTINUITY REQUIREMENTS:\n`;
    prompt += `- Account for ALL characters mentioned in previous chapters\n`;
    prompt += `- Provide clear transitions between locations\n`;
    prompt += `- Progress at least one active plot thread\n`;
    prompt += `- Reference previous events when relevant\n`;
    prompt += `- Maintain character personality and abilities\n\n`;

    // Handle location transitions
    if (this.requiresLocationTransition(userInput)) {
      const transition = this.generateLocationTransition(userInput);
      prompt += `LOCATION TRANSITION REQUIRED:\n`;
      prompt += `- From: ${transition.fromLocation}\n`;
      prompt += `- To: ${transition.toLocation}\n`;
      prompt += `- Method: ${transition.method}\n`;
      prompt += `- Include clear explanation of how characters move between locations\n\n`;
    }

    // Address consistency issues
    if (consistency.issues.length > 0) {
      prompt += `RESOLVE THESE ISSUES:\n`;
      consistency.issues.forEach(issue => {
        prompt += `- ${issue}\n`;
      });
      prompt += `\n`;
    }

    // User story direction
    prompt += `USER DIRECTION: ${userInput}\n\n`;

    // Chapter generation guidelines
    prompt += `CHAPTER GENERATION GUIDELINES:\n`;
    prompt += `- Start chapter with clear connection to previous events\n`;
    prompt += `- Keep all active characters involved or explain their absence\n`;
    prompt += `- Show clear cause-and-effect relationships\n`;
    prompt += `- End with natural progression toward story goal\n`;
    prompt += `- Maintain logical consistency with established world rules\n`;

    return prompt;
  }

  // Update story context after chapter generation
  updateStoryContext(generatedChapter: string, userChoices: any): void {
    this.storyContext.currentChapter++;

    // Parse generated content to update context
    const newEvent = this.extractStoryEvent(generatedChapter);
    this.storyContext.previousEvents.push(newEvent);

    // Update character states
    this.updateCharacterStates(generatedChapter);

    // Update plot threads
    this.updatePlotThreads(generatedChapter, userChoices);

    // Update locations
    this.updateLocationStates(generatedChapter);

    // Add new open questions or resolve existing ones
    this.updateOpenQuestions(generatedChapter);
  }

  private isCharacterLocationValid(character: CharacterState): boolean {
    const location = this.storyContext.locations.find(loc => loc.name === character.currentLocation);
    return location ? location.charactersPresent.includes(character.name) : false;
  }

  private generateSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // Character management suggestions
    const inactiveCharacters = this.storyContext.characters.filter(c => 
      !c.isActive && c.lastSeenChapter < this.storyContext.currentChapter - 2
    );
    
    if (inactiveCharacters.length > 0) {
      suggestions.push(`Consider reintroducing: ${inactiveCharacters.map(c => c.name).join(', ')}`);
    }

    // Plot progression suggestions
    const staleThreads = this.storyContext.plotThreads.filter(t => 
      t.status === 'active' && (this.storyContext.currentChapter - t.introducedChapter) > 3
    );
    
    if (staleThreads.length > 0) {
      suggestions.push(`Progress these plot threads: ${staleThreads.map(t => t.description).join(', ')}`);
    }

    return suggestions;
  }

  private getActiveCharacters(): CharacterState[] {
    return this.storyContext.characters.filter(c => c.isActive);
  }

  private getCurrentLocation(): LocationState | undefined {
    // Find location where most active characters are present
    const locationCounts = new Map<string, number>();
    
    this.getActiveCharacters().forEach(character => {
      const count = locationCounts.get(character.currentLocation) || 0;
      locationCounts.set(character.currentLocation, count + 1);
    });

    const primaryLocationName = Array.from(locationCounts.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    return this.storyContext.locations.find(loc => loc.name === primaryLocationName);
  }

  private getActivePlotThreads(): PlotThread[] {
    return this.storyContext.plotThreads.filter(t => t.status === 'active');
  }

  private requiresLocationTransition(userInput: string): boolean {
    // Simple heuristics to detect if user is requesting location change
    const locationKeywords = ['go to', 'move to', 'travel to', 'walk to', 'enter', 'leave', 'outside', 'inside'];
    return locationKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
  }

  private generateLocationTransition(userInput: string): TransitionRequirement {
    const currentLocation = this.getCurrentLocation()?.name || 'unknown';
    
    // Extract destination from user input (simplified)
    let destination = 'new location';
    if (userInput.includes('cave')) destination = 'cave';
    if (userInput.includes('school')) destination = 'school';
    if (userInput.includes('playground')) destination = 'playground';
    if (userInput.includes('forest')) destination = 'forest';

    return {
      fromLocation: currentLocation,
      toLocation: destination,
      method: 'walking together',
      duration: 'short journey',
      charactersInvolved: this.getActiveCharacters().map(c => c.name),
      explanation: 'Characters move together with clear motivation and method'
    };
  }

  private extractStoryEvent(generatedChapter: string): StoryEvent {
    // Parse chapter to extract key story event
    // This is simplified - could use more sophisticated NLP
    
    const characters = this.getActiveCharacters().map(c => c.name);
    const presentCharacters = characters.filter(name => 
      generatedChapter.toLowerCase().includes(name.toLowerCase())
    );

    return {
      chapter: this.storyContext.currentChapter,
      description: generatedChapter.substring(0, 200) + '...', // First 200 chars as summary
      charactersInvolved: presentCharacters,
      location: this.getCurrentLocation()?.name || 'unknown',
      consequences: [], // Would be extracted from content analysis
      unresolved: true // Default to unresolved until explicitly resolved
    };
  }

  private updateCharacterStates(generatedChapter: string): void {
    // Update which characters appeared in this chapter
    this.storyContext.characters.forEach(character => {
      if (generatedChapter.toLowerCase().includes(character.name.toLowerCase())) {
        character.lastSeenChapter = this.storyContext.currentChapter;
        character.isActive = true;
      }
    });
  }

  private updatePlotThreads(generatedChapter: string, userChoices: any): void {
    // Check if any plot threads were resolved or progressed
    // This would involve more sophisticated content analysis
    
    this.storyContext.plotThreads.forEach(thread => {
      if (thread.status === 'active') {
        // Simple check for resolution keywords
        if (generatedChapter.toLowerCase().includes('solved') || 
            generatedChapter.toLowerCase().includes('found') ||
            generatedChapter.toLowerCase().includes('home')) {
          
          if (thread.description.includes('find') || thread.description.includes('help')) {
            thread.status = 'resolved';
          }
        }
      }
    });
  }

  private updateLocationStates(generatedChapter: string): void {
    // Extract location information from generated chapter
    // Update character presence in locations
    
    const currentLoc = this.getCurrentLocation();
    if (currentLoc) {
      currentLoc.charactersPresent = this.getActiveCharacters()
        .filter(c => c.currentLocation === currentLoc.name)
        .map(c => c.name);
    }
  }

  private updateOpenQuestions(generatedChapter: string): void {
    // Add questions raised by the chapter
    // Remove questions that were answered
    
    // This would involve sophisticated text analysis
    // For now, basic heuristics
    
    if (generatedChapter.includes('?')) {
      const questions = generatedChapter.match(/[^.!?]*\?/g) || [];
      questions.forEach(q => {
        if (!this.storyContext.openQuestions.includes(q.trim())) {
          this.storyContext.openQuestions.push(q.trim());
        }
      });
    }
  }

  // Get story summary for context
  getStorySummary(): string {
    const summary = [];
    
    summary.push(`Story Progress: Chapter ${this.storyContext.currentChapter}`);
    summary.push(`Active Characters: ${this.getActiveCharacters().map(c => c.name).join(', ')}`);
    summary.push(`Current Location: ${this.getCurrentLocation()?.name || 'Unknown'}`);
    summary.push(`Active Plot Threads: ${this.getActivePlotThreads().length}`);
    summary.push(`Unresolved Events: ${this.storyContext.previousEvents.filter(e => e.unresolved).length}`);

    return summary.join('\n');
  }
}

export interface ConsistencyCheck {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

// Helper function to initialize story context from first chapter
export function initializeStoryContext(firstChapter: string, genre: string): StoryContext {
  const context: StoryContext = {
    currentChapter: 1,
    characters: [],
    locations: [],
    plotThreads: [],
    previousEvents: [],
    openQuestions: [],
    narrativeGoals: []
  };

  // Extract initial characters (simplified parsing)
  const characterNames = extractCharacterNames(firstChapter);
  context.characters = characterNames.map(name => ({
    name,
    currentLocation: 'playground', // Default from the example
    emotionalState: 'excited',
    abilities: [] as string[],
    relationships: {} as { [characterName: string]: string },
    lastSeenChapter: 1,
    isActive: true
  }));

  // Set initial plot thread based on genre and first chapter
  if (firstChapter.includes('help') && firstChapter.includes('home')) {
    context.plotThreads.push({
      id: 'main_quest',
      description: 'Help Sparkle find her way home',
      status: 'active',
      introducedChapter: 1,
      expectedResolution: 'Characters successfully help Sparkle reach her cave',
      relatedCharacters: ['Sparkle', ...characterNames]
    });
  }

  return context;
}

function extractCharacterNames(text: string): string[] {
  // Simple extraction - in production would use more sophisticated NLP
  
  // Look for capitalized words that appear multiple times
  const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const wordCounts = new Map<string, number>();
  
  words.forEach(word => {
    if (word.length > 2 && !['The', 'They', 'She', 'He', 'It', 'There', 'This', 'That'].includes(word)) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  // Return words that appear more than once (likely character names)
  return Array.from(wordCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([word]) => word);
} 