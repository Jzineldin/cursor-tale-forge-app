
import Replicate from "https://esm.sh/replicate@0.25.2";
import { POLLING_INTERVAL_MS, MAX_POLLING_ATTEMPTS } from './config.ts';
import { sleep } from './utils.ts';

const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
if (!replicateApiKey) {
    throw new Error("REPLICATE_API_KEY is not set. Please add it to your project secrets.");
}
const replicate = new Replicate({ auth: replicateApiKey });

export async function startAnimation(imageUrl: string) {
    console.log(`Starting animation with Replicate for image: ${imageUrl}`);
    const startResponse = await replicate.predictions.create({
        version: "3f0457e4619daac51203dedb472816fd4af51d315ae7a9cad966280da19659f8", // Stable Video Diffusion model
        input: {
            input_image: imageUrl,
            video_length: "25_frames_with_svd_xt",
            sizing_strategy: "maintain_aspect_ratio",
            motion_bucket_id: 40,
            cond_aug: 0.02
        },
    });

    if (startResponse.status === 'failed' || startResponse.status === 'canceled') {
        throw new Error(`Replicate prediction failed to start. Status: ${startResponse.status}, Error: ${JSON.stringify(startResponse.error)}`);
    }

    console.log(`Started animation task. Prediction ID: ${startResponse.id}`);
    return startResponse;
}

export async function pollForCompletion(initialPrediction: any) {
    let prediction = initialPrediction;
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled' && attempts < MAX_POLLING_ATTEMPTS) {
        attempts++;
        console.log(`Polling attempt ${attempts}/${MAX_POLLING_ATTEMPTS} for prediction ${prediction.id}...`);
        await sleep(POLLING_INTERVAL_MS);
        prediction = await replicate.predictions.get(prediction.id);
        console.log(`Prediction ${prediction.id} status: ${prediction.status}`);
    }

    if (prediction.status !== 'succeeded') {
      throw new Error(`Animation prediction ${prediction.id} did not succeed. Final status: ${prediction.status}. Error: ${JSON.stringify(prediction.error)}`);
    }
    
    const videoUrl = prediction.output;
    if (!videoUrl || typeof videoUrl !== 'string') {
        throw new Error(`Replicate prediction succeeded but did not return a valid video URL. Output: ${JSON.stringify(prediction.output)}`);
    }

    return videoUrl;
}
