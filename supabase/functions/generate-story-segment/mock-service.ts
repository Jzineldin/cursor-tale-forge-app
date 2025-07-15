
export function generateMockResponse(prompt: string) {
  console.log('Using mock response as final fallback');
  
  return {
    segmentText: `Your adventure begins with ${prompt}. The path ahead is full of mystery and wonder, waiting for your next decision.`,
    choices: [
      "Explore the mysterious path ahead",
      "Look around for clues",
      "Call out to see if anyone responds"
    ],
    isEnd: false,
    imagePrompt: "A mystical adventure scene with a winding path through an enchanted forest, soft lighting, fantasy art style",
    visualContext: {
      style: "Fantasy digital art with warm lighting",
      characters: {}
    },
    narrativeContext: {
      summary: `The adventure begins with ${prompt}. The protagonist stands at the threshold of their journey.`,
      currentObjective: "Begin the adventure and make the first meaningful choice",
      arcStage: "setup"
    }
  };
}
