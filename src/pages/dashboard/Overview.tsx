import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Wallet, History, CreditCard, ArrowDownToLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Overview = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [cryptoPrices, setCryptoPrices] = useState({
    btc: 0,
    eth: 0,
    ltc: 0,
  });
  const [activeTrades, setActiveTrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setProfile(data);

        // Fetch active trades
        const { data: tradesData } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "open");
        setActiveTrades(tradesData || []);
      }
    };

    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd"
        );
        const data = await response.json();
        setCryptoPrices({
          btc: data.bitcoin?.usd || 0,
          eth: data.ethereum?.usd || 0,
          ltc: data.litecoin?.usd || 0,
        });
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    };

    fetchProfile();
    fetchCryptoPrices();

    // Update prices every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total PNL from active trades
  const calculateTotalPNL = () => {
    if (activeTrades.length === 0) return 0;
    
    return activeTrades.reduce((total, trade) => {
      const currentPrice = cryptoPrices[trade.cryptocurrency.toLowerCase() as keyof typeof cryptoPrices];
      if (!currentPrice) return total;
      
      const priceDiff = currentPrice - trade.entry_price;
      const multiplier = trade.position_type === "long" ? 1 : -1;
      const pnl = (priceDiff * multiplier * trade.amount * trade.leverage) / trade.entry_price;
      return total + pnl;
    }, 0);
  };

  const calculateTotalROI = () => {
    if (activeTrades.length === 0) return 0;
    
    const totalInvested = activeTrades.reduce((sum, trade) => sum + trade.amount, 0);
    if (totalInvested === 0) return 0;
    
    return (calculateTotalPNL() / totalInvested) * 100;
  };

  const totalPNL = calculateTotalPNL();
  const totalROI = calculateTotalROI();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bitcoin Live Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-2xl">₿</span>
              <CardTitle>Bitcoin Live Chart</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-background">
              <iframe
                src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BTCUSD&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BTCUSD"
                className="w-full h-full"
                frameBorder="0"
                allowTransparency={true}
                scrolling="no"
                allowFullScreen={true}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="text-xl font-bold text-green-500">
                ${cryptoPrices.btc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Portfolio Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-foreground">Active Trades Profit</span>
                  </div>
                  <span className={`text-xl font-bold ${totalPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPNL >= 0 ? '+' : ''}${totalPNL.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-foreground">Active Trades</span>
                  </div>
                  <span className="text-xl font-bold text-blue-400">{activeTrades.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-400" />
                    <span className="text-foreground">Active Trades ROI</span>
                  </div>
                  <span className={`text-xl font-bold ${totalROI >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate("/dashboard/trade")}
          className="h-20 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
        >
          <BarChart3 className="mr-2 h-5 w-5" />
          Start Trading
        </Button>

        <Button
          onClick={() => navigate("/dashboard/deposit")}
          className="h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Deposit Funds
        </Button>

        <Button
          onClick={() => navigate("/dashboard/withdraw")}
          className="h-20 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
        >
          <ArrowDownToLine className="mr-2 h-5 w-5" />
          Withdraw
        </Button>

        <Button
          onClick={() => navigate("/dashboard/history")}
          className="h-20 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0"
        >
          <History className="mr-2 h-5 w-5" />
          View History
        </Button>
      </div>
    </div>
  );
};

export default Overview;
