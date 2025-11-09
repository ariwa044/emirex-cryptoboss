-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cryptocurrency TEXT NOT NULL,
  position_type TEXT NOT NULL CHECK (position_type IN ('long', 'short')),
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  leverage INTEGER NOT NULL DEFAULT 1,
  pnl NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trades 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" 
ON public.trades 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();