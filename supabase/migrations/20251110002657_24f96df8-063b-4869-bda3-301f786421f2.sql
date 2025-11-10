-- Add crypto wallet address fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN btc_wallet_address TEXT,
ADD COLUMN eth_wallet_address TEXT,
ADD COLUMN ltc_wallet_address TEXT;