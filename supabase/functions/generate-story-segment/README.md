# Generate Story Segment

Simple edge function for generating story content using OVH Qwen2.5 API.

## Usage

POST to `/functions/v1/generate-story-segment` with:
```json
{
  "prompt": "story prompt",
  "age": "7-9",
  "genre": "fantasy"
}
```

Returns:
```json
{
  "text": "generated story content"
}
``` 