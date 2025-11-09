import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Random BTC address for demonstration
  const btcAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userId) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: parseFloat(amount),
          currency: "BTC",
          status: "pending",
          btc_address: btcAddress,
          narration: `Deposit of ${amount} BTC`
        });

      if (error) throw error;

      toast.success("Deposit request submitted! Please send BTC to the address above.");
      setAmount("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Deposit Bitcoin</h1>
        <p className="text-muted-foreground mt-2">Fund your account with Bitcoin</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Bitcoin Deposit Address</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send Bitcoin to this address. Your account will be credited after 3 confirmations.
              </p>
              
              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm font-mono break-all flex-1">{btcAddress}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Expected Amount (BTC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  placeholder="0.00000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Enter the amount you're planning to deposit for tracking purposes
                </p>
              </div>

              <Button 
                onClick={handleDeposit} 
                disabled={loading || !amount}
                className="w-full"
                size="lg"
              >
                {loading ? "Submitting..." : "Submit Deposit Request"}
              </Button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-amber-600 dark:text-amber-400">
              Important Notes:
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Minimum deposit: 0.0001 BTC</li>
              <li>• Deposits require 3 network confirmations</li>
              <li>• Only send Bitcoin (BTC) to this address</li>
              <li>• Sending other cryptocurrencies will result in permanent loss</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Deposit;
