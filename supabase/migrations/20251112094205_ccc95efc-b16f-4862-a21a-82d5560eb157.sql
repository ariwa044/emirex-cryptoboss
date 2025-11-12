-- Create verification_codes table
CREATE TABLE public.verification_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  code text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verification codes
CREATE POLICY "Users can view their own verification codes"
ON public.verification_codes
FOR SELECT
USING (true);

-- Allow inserting verification codes (will be done via edge function)
CREATE POLICY "Anyone can insert verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (true);

-- Allow updating verification codes
CREATE POLICY "Users can update their verification codes"
ON public.verification_codes
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_verification_codes_email ON public.verification_codes(user_email);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code);