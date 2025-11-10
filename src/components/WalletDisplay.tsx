import { Card } from "@/components/ui/card";
import { DollarSign, Bitcoin, Coins } from "lucide-react";

interface WalletDisplayProps {
  usdBalance: number;
  btcPrice: number;
  ethPrice: number;
  ltcPrice: number;
}

const WalletDisplay = ({ usdBalance, btcPrice, ethPrice, ltcPrice }: WalletDisplayProps) => {
  const btcEquivalent = btcPrice > 0 ? usdBalance / btcPrice : 0;
  const ethEquivalent = ethPrice > 0 ? usdBalance / ethPrice : 0;
  const ltcEquivalent = ltcPrice > 0 ? usdBalance / ltcPrice : 0;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-foreground">Crypto Wallet</h1>
        <p className="text-muted-foreground">Manage your digital assets and trading portfolio</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">USD Balance</span>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-foreground">
              ${usdBalance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total USD Balance</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">BTC Equivalent</span>
            <Bitcoin className="h-5 w-5 text-orange-400" />
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-foreground">
              {btcEquivalent.toFixed(8)} BTC
            </div>
            <p className="text-sm text-muted-foreground">
              ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per BTC
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-teal-500/20 to-teal-600/20 border-teal-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">ETH Equivalent</span>
            <Coins className="h-5 w-5 text-teal-400" />
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-foreground">
              {ethEquivalent.toFixed(6)} ETH
            </div>
            <p className="text-sm text-muted-foreground">
              ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per ETH
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">LTC Equivalent</span>
            <Coins className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-foreground">
              {ltcEquivalent.toFixed(4)} LTC
            </div>
            <p className="text-sm text-muted-foreground">
              ${ltcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per LTC
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WalletDisplay;
