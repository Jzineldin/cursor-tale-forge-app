
export const storyPrompts: Record<string, string[]> = {
  'Child-Adapted Story': [
    "A friendly dragon who's afraid of fire needs help from a brave little hero.",
    "In a magical garden, the flowers start singing and need someone to solve their puzzle.",
    "A curious kitten discovers a door to a land made entirely of toys and candy.",
  ],
  'Horror Story': [
    "You receive a letter from a relative you've never met, inviting you to an old mansion.",
    "The antique mirror in your new apartment shows reflections that don't match reality.",
    "Every night at 3 AM, you hear footsteps in the empty apartment above yours.",
  ],
  'Educational Adventure': [
    "While exploring tide pools, you discover a creature that shouldn't exist in these waters.",
    "An ancient artifact in the museum starts glowing when you approach it.",
    "You find a coded message hidden in your grandfather's old science journals.",
  ],
  'Epic Fantasy': [
    "The last dragon egg in the kingdom begins to crack just as dark forces gather.",
    "A mysterious sword appears in your village's ancient stone, waiting for a worthy hand.",
    "The magic that protects your realm is failing, and you hold the key to restoring it.",
  ],
  'Sci-Fi Thriller': [
    "Your AI assistant starts responding to questions you haven't asked yet.",
    "A signal from deep space contains what appears to be blueprints for advanced technology.",
    "You wake up in a research facility with no memory of how you got there.",
  ],
  'Mystery Detective': [
    "A famous author's last novel contains clues to a real unsolved murder case.",
    "The security footage from last night's break-in shows someone who looks exactly like you.",
    "A decades-old missing person case reopens when a key piece of evidence is found.",
  ],
  'Romantic Drama': [
    "You find a box of love letters in your new apartment, addressed to someone with your name.",
    "A chance encounter at a coffee shop leads to a connection that changes everything.",
    "Your best friend asks you to help plan their wedding, but you've been secretly in love with them.",
  ],
  'Adventure Quest': [
    "A treasure map hidden in your attic leads to an adventure spanning three continents.",
    "You inherit a mysterious compass that always points toward what you need most.",
    "A secret society recruits you for a mission that could change the course of history.",
  ],
  'Comedy Adventure': [
    "Your pet goldfish starts giving you surprisingly good life advice.",
    "You accidentally sign up for a reality show where everything goes hilariously wrong.",
    "A mix-up at the post office lands you with a package meant for a secret agent.",
  ],
  'Historical Journey': [
    "You discover a diary from the 1800s that mentions your family name in a mysterious context.",
    "A historical reenactment goes wrong when you find yourself actually in the past.",
    "An old photograph reveals your ancestor was present at a major historical event.",
  ],
};

export const getPromptsForStoryMode = (storyMode: string): string[] => {
  return storyPrompts[storyMode] || [];
};
