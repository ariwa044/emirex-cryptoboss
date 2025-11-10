-- Add profit_balance column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profit_balance numeric DEFAULT 0.00;

-- Add admin action logs table for transaction history
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  details jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view and create admin actions
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);