-- Admin override policies for profiles, transactions, and investments
-- Allow admins to SELECT and UPDATE all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all investments (for stats)
CREATE POLICY "Admins can view all investments"
ON public.investments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));