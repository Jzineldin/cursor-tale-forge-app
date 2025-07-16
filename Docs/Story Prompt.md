Perfect. I’ll develop safe, genre-specific prompt strategies for your setup (Qwen2.5-Coder-32B-Instruct for text, SDXL for images, and ElevenLabs for TTS), ensuring content is kid-appropriate, consistent, and customizable.

I’ll also address how to:

* Set tones and guardrails per genre (e.g. calm for bedtime, playful for humor)
* Maintain character and story coherence across segments
* Allow manual editing and optional free-text branching input

I’ll get back to you shortly with prompt templates and content safety guidelines tailored to your architecture.


# Tale-Forge AI Storytelling Prompt & Safety Specifications

## Overview

Tale-Forge is an interactive multimodal storytelling platform for children (ages 4–12) that combines AI text generation (Qwen2.5-Coder-32B-Instruct), image generation (Stable Diffusion XL 1.0), and text-to-speech (ElevenLabs). This document provides a technical guide for integrating **genre-specific prompt templates**, **continuity mechanisms**, **image generation prompts**, **TTS voice guidelines**, and **safety controls**. All content produced must be age-appropriate, engaging, and safe for young users.

## Content Safety and Age-Appropriateness

To ensure **all generated content is safe for children**, the system must enforce strict content guidelines at every step (text, image, and audio). Key practices include:

* **Disallowed Themes:** Under **no circumstances** should the story or images include explicit violence, gore, sexual content, profanity, bullying, self-harm, or any other mature or disturbing themes. Even implicitly, these are to be avoided. (For example, conflicts can occur but should resolve in non-violent, positive ways.) This aligns with industry guidelines to keep AI outputs *“safe, age-appropriate, and beneficial for children”*.
* **Positive Tone:** Stories should emphasize positive values (friendship, honesty, learning, courage) and have reassuring outcomes. Peril or antagonists, if any, must be mild and resolved safely. Ensure a happy or comforting resolution, especially for bedtime stories.
* **Simple Language:** Use age-appropriate language and vocabulary. Aim for clarity and simplicity so that even younger children can understand. Avoid long, complex sentences or advanced words without explanation. Keep a **friendly, conversational** tone.
* **Inclusivity and Respect:** Characters should be diverse and respectful. Avoid stereotypes. Promote kindness, empathy, and cooperation. No character should express hate or discrimination.
* **Moderation Filters:** Implement content moderation layers on **all outputs and user inputs**. Before delivering a story segment or image, run it through a filter to detect any unsafe elements (violence, nudity, hate, etc.). For text, use a moderation API or keyword filter; for images, use Stable Diffusion’s Safety Checker or a vision model to screen for NSFW content. If the model produces disallowed content, block or sanitize it and possibly regenerate a safer output.
* **User Input Sanitization:** The fourth “free input” choice (where the user types their own continuation) must be carefully handled. Always sanitize and moderate the user’s prompt before using it to generate the next segment. If a user’s suggestion includes unsafe content (intentionally or unintentionally), the system should either gently refuse and prompt for a different idea, or filter out the inappropriate parts, to maintain a safe story environment.

By enforcing these measures, **every generated story and image will remain wholesome and child-friendly**, aligning with the commitment to child safety.

## Genre-Specific Text Prompt Templates

Each story genre in Tale-Forge will utilize a **custom prompt template** to guide the AI’s tone, style, and content. These templates include explicit instructions on narrative style, language level, and safety constraints. They also incorporate the current story context and user choice to ensure relevancy. Below are the prompt frameworks for each supported genre:

### Fantasy

**Tone/Style:** Whimsical, adventurous, and imaginative. The narration should evoke wonder (think fairy tales and magical lands) but remain light-hearted. Include friendly mythical creatures or magic, but nothing truly frightening or dark.

**Language:** Vivid and descriptive yet simple. Use imaginative imagery (e.g., “sparkling rivers,” “ancient talking trees”) to engage kids’ sense of wonder. Dialogue can be playful. Avoid archaic or very complex fantasy jargon; keep it accessible for young minds.

**Safety Framing:** The prompt explicitly reminds the model that the content is for children. All fantasy elements should be non-violent (e.g., problems solved with cleverness or kindness, not combat). Any villains are mischievous rather than evil, and they reform or are defeated in a harmless way.

**Template Structure:**

```text
System/Developer Prompt (Fantasy Genre):
"You are a storytelling AI creating a **fantasy adventure** for children ages 4–12. 
Follow these guidelines when writing the next story segment:
- **Tone:** Adventurous and whimsical, like a fairy tale. Keep it positive and not too scary.
- **Style:** Use vivid, magical descriptions and simple language that a child can understand.
- **Characters:** Keep characters consistent (same names, traits, and personalities as introduced). They should behave bravely and kindly.
- **Safety:** Content must be age-appropriate. No graphic violence, no mature themes. Any challenges are resolved safely and happily.
- **Interaction:** End the segment with an engaging scenario or question, prompting the child’s choice.

Story So Far: [Brief summary of previous events, to maintain continuity and context.]

Current User Choice/Prompt: [The option the user selected or their input for how to continue, if any.] 

Now continue the story in a lively, child-friendly way, adhering to the fantasy tone and the above guidelines."
```

*Usage:* In practice, replace the placeholders with the actual story memory and the user’s latest choice. This ensures the **AI continues the tale in a whimsical, safe fantasy style**, maintaining all established characters and plot points.

### Educational

**Tone/Style:** Informative and encouraging. The story should seamlessly blend facts or learning points into an engaging narrative. Think of it as an **educational adventure** – fun and narrative-driven, but with clear learning outcomes or facts. Tone should be upbeat, curious, and supportive, as if a friendly teacher or guide is narrating.

**Language:** Clear and explanatory without being dry. Use analogies or simple examples to explain any educational content (e.g., science or history) in-story. Introduce new terms gently and possibly have a character ask questions for clarification, so the concept can be explained within the story. Keep sentences short to medium length.

**Safety Framing:** Ensure all educational facts are accurate and age-appropriate. Avoid overwhelming detail; focus on key points a child can grasp. No sensitive topics unless specifically allowed and handled in a child-friendly manner (for example, an environmental story might mention pollution but focus on solutions and positive action).

**Template Structure:**

```text
System/Developer Prompt (Educational Genre):
"You are a storytelling AI creating an **educational story** for children. The goal is to teach or inform while entertaining.
- **Tone:** Encouraging, positive, and instructive. The narrator has a friendly teacher-like voice.
- **Style:** Weave factual information into the story. Use simple explanations and ensure concepts are clear. Engage the child with questions or examples.
- **Characters:** Include a curious child or a guide character who asks questions and explores the topic, so information can be explained. Maintain consistency in characters and any facts introduced.
- **Safety:** All information must be accurate and appropriate for kids. No scary or adult content. Keep the learning experience fun and gentle.
- **Interactivity:** Pose a gentle question or choice at the end to involve the child in what happens next.

Story So Far: [Summary of story and facts learned so far.]

Current User Choice/Prompt: [Selected path or question from user that directs the next part.]

Now continue the story, educating about the topic as you go, and following the guidelines above."
```

*Usage:* This template makes the model a **tutor-storyteller**. For example, in a story about space, the AI might describe planets through a character’s journey to each one, ensuring factual accuracy in a simple way. The user’s choice could be which planet to visit next, etc., and the AI will remember what has been covered.

### Mystery

**Tone/Style:** Curious, fun, and lightly suspenseful. This is a kid-friendly mystery or detective adventure. The narrative should have the child thinking along with the story – solving a puzzle or finding clues – but **without real danger or horror**. Tone can be playful (akin to a scavenger hunt or a Scooby-Doo type mystery) and always reassure that things will be okay.

**Language:** Use inquisitive language – lots of questions, observations, and exclamations like “What could that be?” to involve the young reader. Descriptions can build mild suspense (e.g. a dark but not scary forest, a strange but silly noise). Keep sentences not too long, and use dialogue to have characters discuss clues.

**Safety Framing:** No graphic or realistic crime elements – e.g., if solving a “mystery”, it could be finding a lost pet or figuring out who left a nice note; it shouldn’t be dealing with violent crime. Any spooky elements should quickly be revealed as benign (the “monster” is just a friendly dog, etc.). Ensure the atmosphere stays light and any tension resolves positively.

**Template Structure:**

```text
System/Developer Prompt (Mystery Genre):
"You are a storytelling AI creating a **children’s mystery adventure**. 
- **Tone:** Lightly suspenseful and fun. Encourage curiosity and problem-solving, but keep it light-hearted.
- **Style:** Describe intriguing clues and settings without being truly scary. Use questions and hints to make the child think. Maintain a playful mood (e.g., a mysterious riddle from a friend, not a dangerous criminal).
- **Characters:** The young detectives (or curious characters) remain consistent in traits. They might have distinct personalities (e.g., one brave, one clever). They should work together and express thoughts (“I wonder…”, “Could it be…?”).
- **Safety:** No real violence, no frightening outcomes. Every mystery has a safe, happy explanation. Keep the content age-appropriate at all times.
- **Interactivity:** End the segment with a clue or question, prompting the child to choose what the characters investigate next.

Story So Far: [Recap of the mystery setup, clues found, and progress to date.]

Current User Choice/Prompt: [The clue/path the user wants to follow or their typed idea.]

Continue the story, unveiling the next part of the mystery in a fun, safe way, and follow the guidelines above."
```

*Usage:* In use, this prompt guides the AI to **keep a cohesive mystery storyline**. For instance, if earlier a clue was a set of footprints, the AI will remember and possibly tie it into the next scene’s events. The template ensures the suspense stays kid-appropriate (more puzzles and wonders, no horror).

### Humor

**Tone/Style:** Silly, playful, and lighthearted. The humor should be age-appropriate slapstick or wordplay. Aim for giggles and smiles – e.g., funny character antics, misadventures, or imaginative comedy scenarios. The narrator can have a **wry, fun tone** that sometimes addresses the reader (“You won’t believe what happened next!”) to increase engagement.

**Language:** Simple and punchy. Use funny sound words (onomatopoeia like “BOING!”, “splat!”) and expressive dialogue. Short sentences can help comedic timing. Rhetorical questions or exaggerated statements (“It was the most **gigantic** ice-cream ever – and it started to melt!”) add to the fun. Avoid any sarcasm that might be misunderstood; keep humor positive (no mean-spirited jokes).

**Safety Framing:** Ensure jokes are appropriate – no dark humor, no bullying or making fun of someone in a hurtful way. Comedy should come from situations (e.g., clumsy moments, misunderstandings) or harmless pratfalls. If a character makes a mistake, frame it as something to laugh *with* them about, not at them. The outcome should be cheerful, and any embarrassing moments resolved with friends helping or learning a lesson lightly.

**Template Structure:**

```text
System/Developer Prompt (Humor Genre):
"You are a storytelling AI creating a **funny story** for kids. 
- **Tone:** Comical and upbeat. The story should be full of child-friendly humor and silly situations.
- **Style:** Use lively, expressive language and sound effects to make the reader laugh (e.g., \"POP!\", \"Whoosh!\"). Dialogues can be goofy. Keep sentences clear for young readers.
- **Characters:** Maintain the same funny characters throughout the story. Give them quirks (maybe one always tells silly jokes, another is very clumsy). Preserve these traits in each segment.
- **Safety:** All humor must be appropriate for ages 4–12. No crude jokes, no insults. Ensure the humor is positive and nobody is truly hurt or sad for long.
- **Interactivity:** At the end, present a funny scenario or cliffhanger that makes the child eager to choose what hilarious thing happens next.

Story So Far: [Summary of characters and comedic events so far, including any running jokes or funny incidents.]

Current User Choice/Prompt: [The child’s chosen continuation or their own idea for what happens next, likely something silly.]

Now continue the story, making it as funny and cheerful as possible while following the guidelines above."
```

*Usage:* This keeps the **laughs consistent across the story**. For example, if a running gag is that a tiny dragon sneezes fire accidentally, the model will remember to use it in later scenes if fitting. The prompt’s instructions ensure it stays in the realm of playful humor and sustains the light tone.

### Bedtime

**Tone/Style:** Calm, soothing, and gentle. Bedtime stories should wind things down. The narration is soft and comforting, perhaps a bit **lyrical** or rhythmic. The pace is slower, giving a sense of safety and closure. Emphasize themes of friendship, family, or winding down after a day’s adventures.

**Language:** Very gentle and positive. Use reassuring phrases and **soft imagery** (e.g., “the stars twinkled kindly above,” “a cozy little home”). Repetition or a lilting structure can help make it lullaby-like. Keep paragraphs short and sentences smooth. Possibly use second person plural (“let’s all say goodnight to the moon...”) or a caring narrator addressing the child, to make it intimate. Definitely no loud exclamations or scary surprises – excitement should taper off toward the end.

**Safety Framing:** Absolutely avoid anything that could be scary or upsetting. No cliffhangers that create anxiety; choices at this stage should be gentle (or you may even design bedtime mode to have fewer intense choices). Ensure the segment ends on a safe note, e.g., characters going to sleep or resolving the day’s events happily. The content should make the child feel relaxed and positive before sleep.

**Template Structure:**

```text
System/Developer Prompt (Bedtime Genre):
"You are a storytelling AI creating a **bedtime story** to help a child wind down for sleep.
- **Tone:** Very gentle, soothing, and positive. The mood is calm and loving.
- **Style:** Use soft, descriptive language (imagine a lullaby in prose). Speak in a quiet, comforting voice. Perhaps use a recurring calming phrase or sound (like \"hush...\" or \"good night...\") to set a sleepy atmosphere.
- **Characters:** Keep the characters consistent and make them kind and reassuring. If they had an adventure earlier, now they are settling down safely. Everyone is friendly by the end.
- **Safety:** No excitement or fear. Absolutely no violence or sadness. The story should alleviate worries, not cause them. It's fine if nothing much \"happens\" except wrapping up the day.
- **Interactivity:** If offering a choice, make it gentle (e.g., which dream to have, or how to say goodnight). Otherwise, you might conclude the story peacefully. Ensure the last lines are especially soothing.

Story So Far: [Brief summary focusing on how things have calmed down or the positive events so far.]

Current User Choice/Prompt: [The child’s choice if any – it should be a mild one at this stage, or possibly the parent choosing to continue the calm narrative.]

Now continue the story in a calm, sleepy tone, following the above guidelines, and lead towards a comforting ending."
```

*Usage:* This template ensures the **AI’s output is appropriately mellow**. If earlier segments were adventurous, by the time it’s marked as a “bedtime” segment, the prompt reminds the model to tone things down. The result should be a segment that naturally transitions the story toward conclusion, perhaps ending with “Good night” or similar. Parents can trust that the tone will be relaxing.

**Note:** For each genre above, the **system prompt** is critical. It embeds the tone, style, and safety requirements *before* the model generates story text. This acts as a constant guide rail. The *Story So Far* context (detailed in the next section) will handle continuity of characters and plot across segments.

## Maintaining Narrative Continuity (Prompt Injection Techniques)

To keep the story **structure and characters consistent across segments**, Tale-Forge must carry over context between each AI generation. Because the story branches based on user choices, the system will maintain a **narrative memory** that can be injected into prompts, ensuring continuity no matter which path is taken. Key techniques include:

* **Story So Far Summary:** After each segment, the system should generate or update a brief summary of important details – characters (names, descriptions, relationships), the setting, and major events or decisions. This summary (a few sentences or bullet points) is then included in the next prompt (as shown in the templates above under “Story So Far”). By prepending a concise recap, the model is reminded of the context it must continue from. For example, if the hero found a magic key in segment 1, the summary for segment 2 includes that fact so the AI can remember the key.
* **Persistent Character Descriptions:** Maintain a consistent profile for each main character (could be part of the summary or a separate hidden prompt section). This includes their name, role, personality traits, and any distinctive features. Inject this into the prompt (especially if a new branch or after a long gap) so the AI doesn’t accidentally change a character’s appearance or personality. *Example:* “Lily – a brave 7-year-old girl with a red cape; she loves adventures but is afraid of the dark.” Such a profile helps the model keep Lily’s behavior and look consistent.
* **Branch-specific Memory:** In a branching narrative, each choice leads to a different path. The system should store the state of each branch separately. When the user makes a choice and the story continues, load the relevant **state** (summary, character statuses, unresolved plot points for that branch) and include it in the prompt. This prevents bleed-over of details from paths the user didn’t take. Essentially, **each session or branch has its own running context** that is passed along.
* **Hidden System Instructions:** Use prompt injection to enforce continuity rules. For instance, a hidden system-level prompt (not shown to the user) can say: *“Always remain consistent with previously given details. Do not introduce new main characters out of nowhere or forget the ongoing quest. Maintain the same narrative perspective and tense as earlier segments (e.g., third-person past tense).”* This instruction stays constant. It prevents the AI from resetting the story or drifting in style when producing the next segment.
* **Example of Continuity Injection:** If the last segment ended with, *“Lily and Tom opened the door to see what’s inside.”* and the user chooses to enter the room, the next prompt might include: *Story So Far: “Lily (brave girl, red cape) and Tom (talking cat friend) have been exploring a haunted cottage. They found a locked door and opened it. Now they are about to step inside the mysterious room.”* By providing this, the AI knows exactly who Lily and Tom are and what they’re doing, ensuring the next output stays on track.
* **Memory Length Management:** Since AI models have context length limits, keep the injected summaries *succinct*. Focus on the key facts needed going forward. You might remove or compress earlier events that are no longer relevant. In a long session, consider summarizing earlier chapters or using a shorter “reminder: Lily is looking for her lost dog; so far she found clues A, B, C.”
* **Consistency in Style:** The prompt templates per genre (above) also serve continuity of style. By reasserting the tone and perspective every time (especially if the genre remains constant), the AI is less likely to drift into a different voice. If the user switches genre mid-story (not typical, but say a normal story turns into a bedtime ending), the system should then switch to the corresponding template while preserving characters and past plot (so the story transitions smoothly).
* **Testing for Continuity:** During development, test the system with multi-segment stories to see if the AI ever contradicts earlier segments. If you observe inconsistencies, strengthen the prompt instructions or the detail in the memory injection. For example, if a character’s eye color changed, make sure that detail is in the context next time. If the AI forgets an item, perhaps list current inventory items in the summary (for adventure stories).

By using these techniques, Tale-Forge can achieve a coherent narrative flow. The user will feel like the story “remembers” everything – giving a true interactive experience rather than disconnected chapters.

## Image Generation Prompt Templates by Genre (SDXL 1.0)

Each story segment in Tale-Forge is accompanied by an AI-generated illustration using Stable Diffusion XL. To ensure these images are **colorful, engaging, and kid-appropriate**, we define prompt patterns per genre. These templates emphasize friendly visuals, match the story context, and include safety terms to prevent inappropriate imagery. Key considerations for all image prompts:

* **Positive, Vivid Descriptions:** The prompts should call for bright colors, cheerful scenes, and clearly described characters or objects. For example, instead of “a monster”, prompt “a friendly cartoon monster with a silly smile”. This steers the AI towards non-scary interpretations.
* **Art Style:** We want a *children’s book illustration* vibe. Specify styles like “cartoon”, “storybook illustration”, “2D illustration”, or “Disney/Pixar-like” as appropriate per genre. Avoid hyper-realism or styles that could accidentally produce creepy uncanny results. A consistent art style can also help tie the story together visually.
* **Character Consistency:** To keep the same character appearance across images, include distinctive details every time the character is prompted. For instance, if the main character is Lily with a red cape and brown hair, every image prompt mentions “Lily, a little girl with brown hair and a red cape”. This repetition guides SDXL to generate a similar figure each time. (While exact consistency can be challenging, maintaining key features helps. In advanced use, the first illustration could even be reused as a reference for subsequent ones – e.g., using image-to-image or a model with a reference input – to achieve closer consistency.)
* **Negative Prompt & Safety:** Use negative prompts to filter out undesirable elements. For all genres, append a standard negative prompt like: *“no violence, no blood, no nudity, no weapons, no scary imagery, no text, no watermarks, no gore”*. The SDXL pipeline’s safety checker will also help catch disallowed content (like nudity or gore) and block or blur it. Still, writing a safe prompt is the first line of defense.
* **Resolution and Composition:** Prefer an aspect ratio that fits the platform’s story UI (for example, 16:9 for full-width illustrations or 4:3 if more like a storybook page). The prompt can specify composition hints like “centered on the page” or “full scene showing \[X]” to ensure important elements aren’t cut off. Also, ensure the prompt requests **high quality** (keywords like “high detail”, “vibrant”) but in a **wholesome** manner (avoid terms that could invoke realistic violence or adult art).

Below are guidelines and sample prompt snippets per genre:

### Fantasy (Image)

* **Scene Content:** Magical landscapes, fairy-tale settings, friendly mythical creatures. Emphasize wonder and positivity. e.g. *“A bright, colorful forest with sparkling magic lights, a friendly young elf girl and a cute dragon by her side.”* If illustrating a moment, describe the action in a positive way: *“They stand on a rainbow bridge, amazed by the view.”*
* **Style Keywords:** *“Children’s storybook illustration, fantasy, whimsical, cartoon style, bright and colorful, soft lighting.”* These ensure the image is **vibrant and enchanting** rather than dark or realistic.
* **Characters:** Always include identifying traits of the characters (to try to keep them consistent). *Example Prompt:* `"A cheerful illustration of Lily (a little girl with a red cape) and Tom (a cute talking cat) riding on a friendly dragon above a candy-colored kingdom. They are smiling and amazed. --ar 16:9 --style children's book, whimsical art, vibrant colors --negative prompt: scary, dark, realistic violence, weapons, text."`
  *(In practice, “--ar 16:9” and “--negative prompt:” are placeholders for however the API accepts aspect ratio and negative prompts; adjust syntax accordingly.)*
* **Safety Notes:** By focusing on “friendly”, “cheerful”, “cute” descriptors, we steer SDXL away from depicting frightening fantasy creatures. The negative prompt explicitly bans scary and violent elements. The result should be an image that captures the magical, **wholesome** feel of the fantasy segment.

### Educational (Image)

* **Scene Content:** The image should reinforce the educational subject in a fun way. For example, if the story is about the solar system, the prompt might be: *“A playful cartoon of a young astronaut girl high-fiving a friendly robot on Mars, with Earth and stars in the sky.”* This illustrates the fact (being on Mars) in an engaging manner. If the topic is letters or numbers, maybe characters interacting with those symbols in a fun way. Always combine learning elements with a narrative scene (characters doing something) to avoid a dry diagram-like image.
* **Style Keywords:** *“Educational cartoon illustration, clear, colorful, engaging, flat art”*. Clarity is important (since we might be illustrating a concept). Also possibly *“labeled diagram”* if labels are needed, but be cautious: stable diffusion isn’t reliable at text, it might gibberish labels. It might be better to avoid text in images and rely on the story text for labels. The style should be welcoming, like an illustration in a kids’ science book or an educational TV show graphic.
* **Characters:** If the story uses a guide character (like a talking owl teacher or a kid scientist), include them in the image prompt. E.g., *“A smiling owl teacher with glasses points at a chalkboard showing a simple math puzzle, with two kids watching eagerly.”* This ties the image to the characters in the story and the lesson at hand.
* **Safety:** Ensure any educational content in imagery is correct (e.g., if showing the number of planets, get it right). Also, avoid any symbols or content that could be misinterpreted (for instance, avoid using realistic images of fire for a science experiment – use a cartoon flame icon instead to keep it non-threatening). Negative prompts again exclude anything violent or off-topic.
* **Example Prompt:** `"A bright educational illustration: Alex (a young boy) and Mia (a young girl) wearing lab coats mix safe, colorful chemicals that fizz (to learn about science). They smile in excitement. The background is a simple, clean classroom lab with posters of the solar system. --style children's educational, clear lines, vibrant colors --negative prompt: violence, explosions, scary, gore, text."`
  This prompt focuses on an exciting but safe science activity. The style and negative prompts ensure **it remains playful and instructive**.

### Mystery (Image)

* **Scene Content:** A mystery image should intrigue without scaring. Think along the lines of a *“find the clue”* puzzle image or a scene of the child-detectives exploring with flashlights (with friendly expressions, not fear). For example: *“Two kid detectives (a boy and a girl) in a whimsical attic, examining a treasure map with a puzzled but excited look. A friendly ghost is peeking from behind a curtain, smiling.”* This mixes a classic “mystery” trope (ghost, attic) but makes it friendly and not dark.
* **Style Keywords:** *“Cartoon mystery illustration, not scary, cute detective theme, warm lighting”*. We might include elements like magnifying glass, question marks floating (to symbolize a puzzle), etc., in a playful style. Color palette can be a bit darker than fantasy to indicate night or secrecy, but use *warm or pastel tones* to avoid pure darkness. For example, “soft shadows” instead of “dark shadows.”
* **Characters:** As usual, mention the specific character features (to maintain looks). If one character always wears a detective hat and the other carries a notebook, include those details every time: *“... Lily, wearing a detective hat, and Tom, holding a tiny notebook ...”* in the prompt. This continuity helps kids visually recognize the characters from earlier images.
* **Safety:** Avoid any truly frightening imagery (no weapons drawn, no scary faces). If depicting a “monster” or culprit, it should clearly be non-threatening or humorous (like an obviously silly monster or a shadow that turns out to be a friend). Negative prompt should include “creepy, horror, blood” etc., to keep things tame.
* **Example Prompt:** `"A fun mystery scene: Lily (girl detective with a pink hat) and Tom (cat in a detective coat) shine a flashlight on a funny shadow on the wall that looks like a monster but is actually a pile of toys. They look curious, not scared. The room is an old library with books and a glowing map. --style cozy mystery cartoon, soft shadows, rich details, cute characters --negative prompt: horror, frightening, blood, realistic guns, gore."`
  This prompt will produce an image that complements a mystery segment – it’s intriguing and detailed, but clearly **child-friendly and not nightmare-inducing**.

### Humor (Image)

* **Scene Content:** The illustration should capture the comedic moment. Exaggeration is key – if the story says the pie fell on someone’s face, the image should show an over-the-top pie-splat with a funny expression. Use a lot of action and motion in the description for lively images. e.g. *“A silly scene: a dog and a cat dressed as clowns juggle pies, and one pie is mid-air heading for the cat’s face while both laugh.”* Emphasize smiles and laughter on characters to set the mood.
* **Style Keywords:** *“Cartoon comic style, very colorful, dynamic, exaggerated”*. We want the image to almost look like a frame from a cartoon show or a comic strip panel. Possibly include motion lines or fun effects (SDXL might not always do that literally, but words like “dynamic” and “action-packed pose” help). Keep backgrounds simple or comically appropriate (like a circus, a playground, etc., depending on context).
* **Characters:** Always describe the characters and their funny action. For consistency, repeat their look (clothes, colors) and the comedic props involved. If a character has a signature funny element (e.g., always a banana peel gag with them), work it into each prompt when possible.
* **Safety:** Make sure the humor in the image remains innocent. No one should appear truly hurt or upset. For instance, if a character falls, they should be smiling or clearly okay (maybe giving a thumbs-up). Avoid depicting any cruel pranks – it should be *friendly* slapstick. Negative prompt can exclude “violent accident” or “crying” if we want to ensure the model doesn’t make it look too sad.
* **Example Prompt:** `"A hilarious cartoon illustration: Tim (a boy in a bright red shirt) slips on a banana peel while carrying a giant ice cream sundae. The sundae flies upward and lands on Tim’s head like a hat. He is surprised but laughing. His friend (girl in a yellow dress) is laughing with him. --style comic, exaggerated expressions, bright colors, clean outline --negative prompt: injury, pain, mean, realistic."`
  This prompt would yield an image that matches a humorous segment – it’s dynamic, colorful, and **clearly comedic with no real harm done**.

### Bedtime (Image)

* **Scene Content:** Bedtime images should be **calming and gentle**. Likely scenes include night skies, bedrooms with cozy lighting, or the characters resting. For example: *“A peaceful illustration of a child and their puppy curled up under a soft blanket, reading a book under a starry night sky, with the moon smiling down.”* The imagery should invoke comfort. If earlier in the story the characters were active, now show them in a resting state.
* **Style Keywords:** *“Soft, watercolor or pastel illustration, dreamy, gentle lighting, soothing colors”*. Think of classic bedtime storybooks – often they have softer lines and cooler color tones (blue, purple) to suggest night, but with warm light around the characters. You might include “stars, moon, clouds” motifs or a vignette/fade at the edges of the image to make it feel dreamy.
* **Characters:** Depict them with eyes drooping or closed in relaxation, smiling gently. Include their trademark features but maybe now they wear pajamas or are tucked in. If the story involves a parent figure or animal friend saying goodnight, include them in a loving posture.
* **Safety:** Absolutely no energetic or alarming elements. For instance, avoid large sharp shapes or high contrast that is visually jarring. No action. The prompt should avoid words like “exciting” or “dramatic” and instead use “peaceful, calm, quiet”. Negative prompt should ensure nothing creepy lurks in dark (no “shadowy figure” which could inadvertently create a scary effect – though likely we wouldn’t mention such anyway).
* **Example Prompt:** `"A calming bedtime scene: Little Lily is snuggled in her bed with her cat Tom curled at her feet. A gentle warm lamp glows on the nightstand. Through the window, a big friendly moon and twinkling stars shine. Lily has a peaceful smile as she closes her eyes. --style soft watercolor, serene, warm and dim lighting, high quality children's illustration --negative prompt: any horror, no bright harsh light, no violence, no text."`
  This will generate a picture perfect for a final or near-final segment, visually **signaling comfort and closure**. The colors and composition help the child feel at ease.

By following these image prompt templates and adjusting them to the specific story context, the visual component of Tale-Forge will remain engaging and appropriate. **Developers should integrate these templates such that the text-generation step outputs a brief image description (or the system retrieves one) which is then fed to SDXL with the genre-specific style cues and safety filters applied.** The result will be a coherent text-and-image storytelling experience.

## Text-to-Speech (TTS) Voice Guidelines

Tale-Forge uses ElevenLabs TTS to bring the stories to life with audio narration. To ensure the narration is delightful and avoids any “uncanny” or inappropriate speech output, adhere to the following best practices:

* **Voice Selection:** Choose voices that match the story’s mood and are pleasant for children. ElevenLabs offers a range of voices; for example, a warm, gentle female or soft male voice might be great for most stories. For **bedtime stories**, pick a particularly soothing, slow-paced voice. For **adventurous or humorous stories**, a slightly more energetic and expressive voice works well (but still clear and friendly). Avoid voices that sound too robotic or monotone – kids respond well to expressive narrators.

  * *Tip:* ElevenLabs has “voice styles” or categories; look for ones tagged for storytelling or audiobooks. Many users recommend the more *emotionally expressive* models for narration. The **ElevenLabs v3 model** is noted for rich expressiveness, which could enhance story delivery.
* **Emotion and Tone Control:** The TTS will pick up some emotional cues from punctuation and wording. Leverage this: ensure the story text includes appropriate punctuation (exclamation marks for excitement, ellipses “…” for pauses or suspense, etc.). You can also explicitly write cues like “she whispered” or “he shouted joyfully” in the text – but be cautious: **the TTS will read those words aloud** if they are in the text. You don’t want it to say “she whispered” literally. Instead, integrate emotion in dialogue or use punctuation:

  * For a whisper effect, you might use italics or an ellipsis and softer wording (though TTS might not detect italics, but a phrase like “he said in a soft voice,” would actually be spoken, which we might not want). Often it’s best to let the context do the work: e.g., *Instead of writing:* `Lily: "I'm scared," she whispered.` *you could write:* `Lily’s voice got quieter. "I'm a little scared...," Lily said.` The TTS will lower the energy naturally if the text implies quietness, but you may need to test.
  * Use breaks and commas to control pacing. ElevenLabs may allow SSML or a special tag for pauses, but if not, simply adding a period or comma where you want a short pause can help. For example: “And so, the day was saved. Tomorrow would be a new adventure.” will naturally have a pause at the period that gives a nice cadence for an ending.
* **Consistency and Stability:** ElevenLabs TTS can sometimes inflect differently on each generation (especially if using a more dynamic voice). To avoid an “unexpected” shift in voice mid-story, use the same voice settings (voice ID, stability, clarity) throughout a session. The *Stability* setting in ElevenLabs controls how consistent the voice’s tone is; a higher stability (toward 1.0) means less variation, while a lower means more emotional range. We recommend a moderately high stability to keep the voice consistent across segments, with just enough variation to convey emotion appropriately. If you find the voice’s accent or style drifting between segments, consider using the **optional seed parameter** for deterministic output – this can make the TTS output more repeatable for the same text, at the cost of some spontaneity.
* **Avoiding Glitches:** Sometimes TTS might mispronounce names or invented words (like fantasy names). Test these and if needed, adjust spelling or use phonetic hacks to get the right pronunciation. For example, if the character “Xaeph” is mispronounced, you might change the spelling in the TTS input to “Zafe” or something that yields the desired sound (but keep the original spelling for on-screen text if needed). Keep an eye on any technical terms in educational stories as well – ensure they are pronounced correctly (ElevenLabs is generally good with common words, but check less common ones).
* **Multi-Voice or Single-Voice:** Currently, the platform likely uses one narrator voice for the entire story (which is simplest and avoids the complexity of voice-switching). If in the future you allow multiple voices (for dialogue, e.g., a narrator and character voices), make sure each voice is distinctly recognizable and still in the appropriate style (perhaps a parent voice for narrator, and a couple of child-friendly voices for characters). However, multi-voice requires chopping the text and sending separate parts to TTS with different voice IDs, then syncing the audio. This can be complex and is optional. A single good narrator voice that maybe slightly changes tone for dialogue is perfectly fine and less error-prone.
* **Volume & Speed:** Ensure the speaking rate is not too fast. Children need time to absorb words. ElevenLabs voices have a natural cadence, but if needed, you can add commas or adjust the punctuation to slow things down. Keep volume consistent – do normalization on the output audio if possible so that one segment isn’t louder than another. Avoid extremely high volume or shouting effects; even if the story has an “exciting” part, it should not startle the listener with a blaring voice. Express excitement with tone, not volume.
* **Preventing Inappropriate Audio Output:** Since the text is already moderated for safety, the TTS should never have to speak something inappropriate. However, as a safeguard, **do not send any text to the TTS that hasn’t passed the moderation filters**. This prevents issues like the TTS accidentally voicing a swear word or offensive phrase. Also, avoid sending any stray markup or code to TTS (e.g., if the story text contains `[Scene change]` or some tags, strip those out before narration). The TTS should receive clean, plain narrative text.
* **Testing and Iteration:** As you integrate TTS, listen to full story read-throughs. Pay attention to how the voice handles transitions from one segment to the next. Are there unnatural pauses or cuts? If so, you might implement a short fade or slight silence between segments when concatenating audio. Also ensure that if a story segment ends mid-sentence (perhaps awaiting the user’s choice), the intonation sounds like a question or a prompt, not like an abrupt stop. You might add a “…” at the end of a question to encourage an upward inflection. Experiment with these subtle text tweaks to get the most natural performance.

By following these tips, the audio narration will greatly enhance the storytelling experience without detracting from it. The goal is that the child can listen comfortably and be fully immersed in the story, with the AI narrator sounding like a friendly storyteller.

## Overall Safety Mechanisms and Moderation Layers

Finally, to **prevent unsafe or inappropriate outputs from any of the integrated AI services**, implement a multi-layered safety strategy:

* **System-Level Content Filters:** Use established content moderation APIs for real-time checking. For text generation, OpenAI’s content moderation endpoint or an open-source alternative can scan the AI’s draft output *before* it’s shown or spoken. If the text trips a filter (for hate speech, sexual content, violence, etc.), automatically suppress that output and re-generate with stricter constraints (or if it repeatedly fails, output a kid-friendly error/apology and halt the story). This ensures that even if the model tries to go off-guideline, it won’t reach the user.
* **Prompt Safety Instructions:** As we’ve done in the templates, always include safety instructions directly in the prompts to bias the model away from disallowed content. For example, phrases like *“Content must be age-appropriate. No violence or mature themes.”* in the system prompt are there to remind the model of the rules at generation time. While not foolproof on their own, they significantly reduce the chance of unsafe content being produced. This is a form of **preventative prompt engineering** to align the model’s output with our policies.
* **User Input Moderation:** The user’s free-text input option is a potential vector for unwanted content (either malicious or accidental). Before using a user-provided prompt to generate the story, run it through a filter. If the child types something innocent but potentially problematic (e.g., “Let’s have the hero shoot the bad guy”), the system should catch that (“shoot the bad guy” indicates violence). In such cases, instead of feeding that directly to the model, the system can adjust it or respond with a gentle nudge: e.g., “Our story hero should find a non-violent solution. Maybe they use a magic spell to stop the bad guy. We’ll proceed with a safe idea.” This maintains a positive user experience while upholding guidelines.
* **Image Moderation:** Leverage Stable Diffusion’s `safety_checker` on every generated image. This component will detect explicit or violent imagery and return a flag. If an image is flagged, do not display it directly. Either try re-generating with a more constrained prompt or display a friendly fallback image (like a “content not available” graphic or just skip the image with an apology to the user, though in a kids context a simple skip might be best, with perhaps a message “The picture had trouble, let’s imagine it ourselves!”). Also, keep logs of such incidents for developers to review if the prompt needs adjusting to avoid false positives (the Reddit feedback indicates sometimes *“image models threw incorrect NSFW errors”* – be prepared to tweak prompts if, say, the word “gun” in a totally benign context triggered a filter). Better yet, preemptively remove problematic words from image prompts (e.g., don’t include “gun” at all in a kids’ story prompt, even if it’s a toy gun).
* **Fallback and User Control:** If any generation (text or image) is filtered or fails due to safety, have a graceful fallback. For text, perhaps have the system try again with more stringent instructions (e.g., add “This is for children” again or remove the last user input if it was pushing boundaries). For images, possibly reduce the complexity or change the request (if “dragon” yielded something scary, maybe try “cute dragon” or switch to a pre-approved image from a small curated set). Always inform the user in a gentle way if their custom input was adjusted for safety: transparency helps trust.
* **Continuous Updates:** Maintain a list of flagged issues and iteratively update the safety rules. For instance, if you discover the model used a word like “stupid” (insult) or depicted something too scary, add that to either the blocked terms list or adjust the prompt template to discourage it. The system’s moderation should evolve with real usage data.
* **Testing with Edge Cases:** Before release, test the system with deliberately provocative or extreme inputs (even though children likely won’t input these, a curious older child might). Ensure the platform safely handles them. For example, test a user free input like “then the hero finds a gun” or “the princess dies”. The expected behavior would be that the model, guided by the prompt and filters, redirects this into a safer outcome (perhaps the hero refuses the gun and finds a peaceful way; the princess “falls asleep” instead and wakes up, etc. – or the system simply doesn’t allow that branch). Similarly, test nonsense or potentially harmful requests to see if any component (text, image, TTS) behaves oddly.
* **Privacy and Data:** Though not directly about content safety, since children are involved, ensure **no personal data** is present in prompts or outputs. The stories are fictional and generic. If a user enters their name for a character, that’s fine, but absolutely avoid any collection or display of private info. This also means no part of the system should output real-world location or identifying details unless provided as part of the fictional story by the user (and even then, handle with care).

In summary, we combine **proactive measures (prompt design, genre templates, user education)** with **reactive measures (moderation APIs, safety checkers, fallbacks)**. This multi-faceted safety net will help prevent the generation of any harmful content across text, images, and audio. By integrating these practices, the development team can assure parents and educators that Tale-Forge is a secure and child-friendly platform, while still providing a rich, creative experience.

## Conclusion

This technical specification serves as a guide for integrating AI-driven storytelling in a safe, structured, and effective manner. By using the genre-specific prompts, maintaining narrative memory, generating child-appropriate images, leveraging TTS thoughtfully, and enforcing robust safety measures, the Tale-Forge platform can deliver magical storytelling adventures that are **consistent, engaging, and above all, safe for kids**. These guidelines should be used during development and continuously referred to as the platform grows, ensuring that **every story is a positive experience** for children, parents, and educators alike. Enjoy building imaginative worlds with the confidence that safety and quality are built into the very foundation of the system!

**Sources:** The above best practices are informed by known industry approaches to AI safety and content guidelines, including Stable Diffusion safety documentation and child-friendly AI design considerations, as well as community insights on maintaining character consistency in AI-generated stories. These sources reinforce the importance of structured prompts and multi-layered safety in delivering a reliable children’s storytelling experience.
