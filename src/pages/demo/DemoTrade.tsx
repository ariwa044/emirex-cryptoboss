import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DemoTrade {
  id: string;
  cryptocurrency: string;
  position_type: string;
  entry_price: number;
  current_price: number;
  amount: number;
  leverage: number;
  pnl: number;
  timestamp: number;
}

const DemoTrade = () => {
  const { toast } = useToast();
  const [demoBalance, setDemoBalance] = useState(100000);
  const [trades, setTrades] = useState<DemoTrade[]>([]);
  const [cryptocurrency, setCryptocurrency] = useState("bitcoin");
  const [positionType, setPositionType] = useState("long");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedBalance = localStorage.getItem("demoBalance");
    const savedTrades = localStorage.getItem("demoTrades");
    if (savedBalance) setDemoBalance(parseFloat(savedBalance));
    if (savedTrades) setTrades(JSON.parse(savedTrades));
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [cryptocurrency]);

  const fetchPrice = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptocurrency}&vs_currencies=usd`
      );
      const data = await response.json();
      setCurrentPrice(data[cryptocurrency]?.usd || 0);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  const handleTrade = () => {
    const tradeAmount = parseFloat(amount);
    const tradeLeverage = parseInt(leverage);

    if (!tradeAmount || tradeAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    const totalRequired = tradeAmount * tradeLeverage;
    if (totalRequired > demoBalance) {
      toast({ title: "Insufficient Balance", description: "Not enough demo funds", variant: "destructive" });
      return;
    }

    const newTrade: DemoTrade = {
      id: Date.now().toString(),
      cryptocurrency,
      position_type: positionType,
      entry_price: currentPrice,
      current_price: currentPrice,
      amount: tradeAmount,
      leverage: tradeLeverage,
      pnl: 0,
      timestamp: Date.now(),
    };

    const newBalance = demoBalance - totalRequired;
    const updatedTrades = [...trades, newTrade];

    setDemoBalance(newBalance);
    setTrades(updatedTrades);
    localStorage.setItem("demoBalance", newBalance.toString());
    localStorage.setItem("demoTrades", JSON.stringify(updatedTrades));

    toast({ title: "Trade Opened", description: `Demo ${positionType} position opened successfully` });
    setAmount("");
  };

  const closeTrade = (trade: DemoTrade) => {
    const priceChange = trade.current_price - trade.entry_price;
    const multiplier = trade.position_type === "long" ? 1 : -1;
    const pnl = (priceChange / trade.entry_price) * trade.amount * trade.leverage * multiplier;
    
    const newBalance = demoBalance + trade.amount * trade.leverage + pnl;
    const updatedTrades = trades.filter(t => t.id !== trade.id);

    setDemoBalance(newBalance);
    setTrades(updatedTrades);
    localStorage.setItem("demoBalance", newBalance.toString());
    localStorage.setItem("demoTrades", JSON.stringify(updatedTrades));

    toast({
      title: "Trade Closed",
      description: `Demo PNL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
      variant: pnl >= 0 ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Demo Trading</h1>
        <p className="text-muted-foreground">Practice trading with virtual funds</p>
        <p className="text-lg font-semibold mt-2">Demo Balance: ${demoBalance.toLocaleString()}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Open Position</h2>
          <div className="space-y-4">
            <div>
              <Label>Cryptocurrency</Label>
              <Select value={cryptocurrency} onValueChange={setCryptocurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                  <SelectItem value="litecoin">Litecoin (LTC)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Current Price: ${currentPrice.toLocaleString()}
              </p>
            </div>

            <div>
              <Label>Position Type</Label>
              <Select value={positionType} onValueChange={setPositionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long (Buy)</SelectItem>
                  <SelectItem value="short">Short (Sell)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label>Leverage</Label>
              <Select value={leverage} onValueChange={setLeverage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleTrade} className="w-full" disabled={loading}>
              Open Trade
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
          <div className="space-y-3">
            {trades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No open trades</p>
            ) : (
              trades.map((trade) => (
                <div key={trade.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{trade.cryptocurrency.toUpperCase()}</span>
                    <span className={trade.position_type === "long" ? "text-success" : "text-destructive"}>
                      {trade.position_type === "long" ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
                      {" "}{trade.position_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Entry: ${trade.entry_price.toLocaleString()}</div>
                    <div>Amount: ${trade.amount} × {trade.leverage}x</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => closeTrade(trade)}
                    className="w-full"
                  >
                    Close Trade
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoTrade;
