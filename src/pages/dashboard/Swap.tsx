import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, TrendingUp } from "lucide-react";

const Swap = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [cryptocurrency, setCryptocurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<{ BTC: number; ETH: number; LTC: number }>({
    BTC: 0,
    ETH: 0,
    LTC: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setProfile(profileData);
      }
    };

    fetchData();
    fetchPrices();

    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd"
      );
      const data = await response.json();
      setPrices({
        BTC: data.bitcoin?.usd || 0,
        ETH: data.ethereum?.usd || 0,
        LTC: data.litecoin?.usd || 0,
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  const getCurrentPrice = () => {
    return prices[cryptocurrency as keyof typeof prices];
  };

  const getCryptoBalance = () => {
    if (cryptocurrency === "BTC") return profile?.btc_balance || 0;
    if (cryptocurrency === "ETH") return profile?.eth_balance || 0;
    if (cryptocurrency === "LTC") return profile?.ltc_balance || 0;
    return 0;
  };

  const getUSDValue = () => {
    const cryptoAmount = parseFloat(amount) || 0;
    return cryptoAmount * getCurrentPrice();
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const cryptoAmount = parseFloat(amount);
    const cryptoBalance = getCryptoBalance();

    if (cryptoAmount > cryptoBalance) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${cryptocurrency}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const usdValue = getUSDValue();

      const updates: any = {
        usd_balance: (profile?.usd_balance || 0) + usdValue,
      };

      if (cryptocurrency === "BTC") {
        updates.btc_balance = cryptoBalance - cryptoAmount;
      } else if (cryptocurrency === "ETH") {
        updates.eth_balance = cryptoBalance - cryptoAmount;
      } else if (cryptocurrency === "LTC") {
        updates.ltc_balance = cryptoBalance - cryptoAmount;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user?.id,
        type: "swap",
        currency: cryptocurrency,
        amount: cryptoAmount,
        status: "completed",
        narration: `Swapped ${cryptoAmount} ${cryptocurrency} to $${usdValue.toFixed(2)} USD`,
      });

      if (txError) throw txError;

      toast({
        title: "Swap successful",
        description: `Swapped ${cryptoAmount} ${cryptocurrency} to $${usdValue.toFixed(2)} USD`,
      });

      setAmount("");
      
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error swapping:", error);
      toast({
        title: "Error",
        description: "Failed to complete swap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Swap</h1>
        <p className="text-muted-foreground">Convert your crypto to USD balance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Swap Crypto to USD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Cryptocurrency</Label>
              <Select value={cryptocurrency} onValueChange={setCryptocurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Current Rate</Label>
              <div className="text-2xl font-bold text-primary">
                1 {cryptocurrency} = ${getCurrentPrice().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <Label>Amount ({cryptocurrency})</Label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {getCryptoBalance().toFixed(8)} {cryptocurrency}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <Label>You will receive</Label>
              <div className="text-3xl font-bold text-green-500 mt-1">
                ${getUSDValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSwap}
              disabled={loading}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Swap to USD
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">USD Balance</p>
                  <p className="text-xl font-bold">${(profile?.usd_balance || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Bitcoin</p>
                  <p className="text-xl font-bold">{(profile?.btc_balance || 0).toFixed(8)} BTC</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">≈ ${((profile?.btc_balance || 0) * prices.BTC).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Ethereum</p>
                  <p className="text-xl font-bold">{(profile?.eth_balance || 0).toFixed(8)} ETH</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">≈ ${((profile?.eth_balance || 0) * prices.ETH).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Litecoin</p>
                  <p className="text-xl font-bold">{(profile?.ltc_balance || 0).toFixed(8)} LTC</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">≈ ${((profile?.ltc_balance || 0) * prices.LTC).toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-primary">
                    ${(
                      (profile?.usd_balance || 0) +
                      ((profile?.btc_balance || 0) * prices.BTC) +
                      ((profile?.eth_balance || 0) * prices.ETH) +
                      ((profile?.ltc_balance || 0) * prices.LTC)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Swap;
