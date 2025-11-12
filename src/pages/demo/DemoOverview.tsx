import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Wallet, DollarSign } from "lucide-react";

const DemoOverview = () => {
  const [demoBalance, setDemoBalance] = useState(100000);

  useEffect(() => {
    const savedBalance = localStorage.getItem("demoBalance");
    if (savedBalance) {
      setDemoBalance(parseFloat(savedBalance));
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Demo Dashboard</h1>
        <p className="text-muted-foreground">Practice trading with virtual funds</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Demo Balance</p>
              <p className="text-2xl font-bold">${demoBalance.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Trades</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total PNL</p>
              <p className="text-2xl font-bold text-success">$0.00</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoOverview;
