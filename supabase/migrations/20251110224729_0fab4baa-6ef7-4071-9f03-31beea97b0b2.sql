-- Add cryptocurrency balance columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS btc_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS eth_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ltc_balance numeric DEFAULT 0.00;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.btc_balance IS 'Bitcoin balance';
COMMENT ON COLUMN public.profiles.eth_balance IS 'Ethereum balance';
COMMENT ON COLUMN public.profiles.ltc_balance IS 'Litecoin balance';