-- Remove KYC status column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kyc_status;

-- Add ROI balance column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roi_balance numeric DEFAULT 0.00;

-- Add full_name and country columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    username, 
    full_name,
    country,
    usd_balance,
    roi_balance
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'country',
    0.00,
    0.00
  );
  RETURN new;
END;
$function$;