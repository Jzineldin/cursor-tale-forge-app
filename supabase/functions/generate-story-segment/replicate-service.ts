
// Replicate image generation service using FLUX.1-schnell
export async function generateImageWithReplicate(prompt: string): Promise<Blob | null> {
  console.log("Generating image with Replicate FLUX.1-schnell for prompt:", prompt);
  const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');

  if (!replicateApiKey) {
    console.error("Replicate API key is not set. Cannot generate image with Replicate.");
    return null;
  }

  try {
    console.log("Calling Replicate API for image generation...");
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "f15658ad89ec5f9c73ac86a2a813b4a7a3c0e8fa8f60e1d0b7077e7d6b7b7b7b", // FLUX.1-schnell version
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }),
    });

    console.log(`Replicate API response status: ${response.status}`);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Replicate API error:", errorBody);
        throw new Error(`Replicate API returned status ${response.status}: ${errorBody}`);
    }

    const prediction = await response.json();
    console.log("Replicate prediction created:", prediction.id);
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
      }
      
      const status = await statusResponse.json();
      console.log(`Prediction status: ${status.status}`);
      
      if (status.status === 'succeeded') {
        if (status.output && status.output[0]) {
          // Download the image
          const imageResponse = await fetch(status.output[0]);
          if (!imageResponse.ok) {
            throw new Error(`Failed to download image: ${imageResponse.status}`);
          }
          
          const imageBlob = await imageResponse.blob();
          console.log(`Successfully generated image with Replicate. Size: ${imageBlob.size}`);
          return imageBlob;
        } else {
          throw new Error('No output URL in successful prediction');
        }
      } else if (status.status === 'failed') {
        throw new Error(`Prediction failed: ${status.error}`);
      }
      
      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Prediction timed out after 30 seconds');

  } catch (error) {
    console.error("Error calling Replicate API:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
    }
    return null;
  }
}
