import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Bitcoin, Coins, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DashboardContext {
  user: User;
  profile: Profile | null;
}

const Overview = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const [cryptoPrices] = useState({
    btc: 103837.17,
    eth: 3544.62,
    ltc: 109.35,
  });

  const usdBalance = Number(profile?.usd_balance || 0);
  const btcEquivalent = usdBalance / cryptoPrices.btc;
  const ethEquivalent = usdBalance / cryptoPrices.eth;
  const ltcEquivalent = usdBalance / cryptoPrices.ltc;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crypto Wallet</h1>
        <p className="text-muted-foreground">Manage your digital assets and trading portfolio</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">USD Balance</CardTitle>
            <DollarSign className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${usdBalance.toFixed(2)}</div>
            <p className="text-xs text-white/70 mt-1">Total USD Balance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">BTC Equivalent</CardTitle>
            <Bitcoin className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{btcEquivalent.toFixed(8)} BTC</div>
            <p className="text-xs text-white/70 mt-1">${cryptoPrices.btc.toFixed(2)} per BTC</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ETH Equivalent</CardTitle>
            <TrendingUp className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ethEquivalent.toFixed(6)} ETH</div>
            <p className="text-xs text-white/70 mt-1">${cryptoPrices.eth.toFixed(2)} per ETH</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-700 to-gray-800 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LTC Equivalent</CardTitle>
            <Coins className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ltcEquivalent.toFixed(4)} LTC</div>
            <p className="text-xs text-white/70 mt-1">${cryptoPrices.ltc.toFixed(2)} per LTC</p>
          </CardContent>
        </Card>
      </div>

      {/* KYC Verification Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>KYC Verification Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Identity Verification</p>
              <Badge variant="secondary" className="mt-2 bg-orange-500/20 text-orange-600 border-orange-500/30">
                ⚠️ Pending Review
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Complete KYC verification to enable withdrawals and access all features.
              </p>
            </div>
            <Button variant="default" className="bg-primary">
              Complete KYC
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
