-- Clean up OVH settings in admin_settings to remove steps parameter
UPDATE admin_settings 
SET value = jsonb_set(
  value::jsonb #- '{ovhSettings,steps}',
  '{ovhSettings}',
  (value::jsonb -> 'ovhSettings') - 'steps'
)
WHERE key = 'image_providers' 
AND value::jsonb ? 'ovhSettings' 
AND value::jsonb -> 'ovhSettings' ? 'steps';