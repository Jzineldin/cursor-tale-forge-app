-- Create demo usage tracking table
CREATE TABLE demo_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  feature_type text NOT NULL, -- 'voice', 'story', 'image'
  usage_count integer DEFAULT 0,
  date_created date DEFAULT CURRENT_DATE,
  last_used timestamp DEFAULT NOW(),
  UNIQUE(ip_address, feature_type, date_created)
);

-- Enable RLS
ALTER TABLE demo_usage ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage this table
CREATE POLICY "Service role can manage demo_usage" ON demo_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Create increment function
CREATE OR REPLACE FUNCTION increment_demo_usage(
  p_ip_address text,
  p_feature_type text,
  p_date date
)
RETURNS void AS $$
BEGIN
  UPDATE demo_usage 
  SET 
    usage_count = usage_count + 1,
    last_used = NOW()
  WHERE 
    ip_address = p_ip_address 
    AND feature_type = p_feature_type 
    AND date_created = p_date;
END;
$$ LANGUAGE plpgsql;

-- Create function to get demo usage for an IP
CREATE OR REPLACE FUNCTION get_demo_usage(
  p_ip_address text,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(feature_type text, usage_count integer, limit_count integer) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'voice'::text as feature_type,
    COALESCE(du.usage_count, 0) as usage_count,
    3 as limit_count
  FROM demo_usage du
  WHERE du.ip_address = p_ip_address 
    AND du.feature_type = 'voice' 
    AND du.date_created = p_date
  
  UNION ALL
  
  SELECT 
    'story'::text as feature_type,
    COALESCE(du.usage_count, 0) as usage_count,
    10 as limit_count
  FROM demo_usage du
  WHERE du.ip_address = p_ip_address 
    AND du.feature_type = 'story' 
    AND du.date_created = p_date
  
  UNION ALL
  
  SELECT 
    'image'::text as feature_type,
    COALESCE(du.usage_count, 0) as usage_count,
    5 as limit_count
  FROM demo_usage du
  WHERE du.ip_address = p_ip_address 
    AND du.feature_type = 'image' 
    AND du.date_created = p_date;
END;
$$ LANGUAGE plpgsql; 