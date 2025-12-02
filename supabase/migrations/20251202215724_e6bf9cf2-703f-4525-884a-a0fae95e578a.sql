-- Fix: Add admin UPDATE policy for transactions
CREATE POLICY "Admins can update all transactions"
ON public.transactions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for trades table
CREATE POLICY "Admins can view all trades"
ON public.trades
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all trades"
ON public.trades
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));