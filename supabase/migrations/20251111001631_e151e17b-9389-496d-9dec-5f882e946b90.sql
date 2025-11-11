-- Create website settings table
CREATE TABLE IF NOT EXISTS public.website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage website settings"
ON public.website_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Everyone can read settings
CREATE POLICY "Anyone can view website settings"
ON public.website_settings
FOR SELECT
TO authenticated
USING (true);

-- Insert default deposit addresses
INSERT INTO public.website_settings (setting_key, setting_value, description)
VALUES 
  ('deposit_btc_address', 'Not configured', 'Bitcoin deposit address for the platform'),
  ('deposit_eth_address', 'Not configured', 'Ethereum deposit address for the platform'),
  ('deposit_ltc_address', 'Not configured', 'Litecoin deposit address for the platform')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_website_settings_updated_at
  BEFORE UPDATE ON public.website_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();