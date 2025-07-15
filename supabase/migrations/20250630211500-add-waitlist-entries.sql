
-- Add waitlist entries from the provided list
INSERT INTO public.waitlist (name, email, marketing_consent, created_at) VALUES
('Jonas Zineldin', 'jonas.zineldin@gmail.com', false, '2025-06-29 22:44:00+00:00'),
('Kevin Elzarka', 'kevin.elzarka@gmail.com', false, '2025-06-27 16:46:00+00:00'),
('Juan José', 'juanjo.chen@gmail.com', false, '2025-06-27 10:19:00+00:00'),
('Blake', 'blake.froude+ecommerce@gmail.com', true, '2025-06-27 01:39:00+00:00'),
('Josef Zineldin', 'jzineldin@gmail.com', true, '2025-06-21 02:41:00+00:00')
ON CONFLICT (email) DO NOTHING;
