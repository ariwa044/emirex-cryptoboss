import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Bitcoin, Gem, TrendingUp, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Overview = () => {
  const [profile, setProfile] = useState<any>(null);
  const [cryptoPrices] = useState({
    btc: 103837.17,
    eth: 3544.62,
    ltc: 109.35,
  });

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
      }
    };

    fetchProfile();
  }, []);

  const usdBalance = profile?.usd_balance || 0;
  const btcEquivalent = usdBalance / cryptoPrices.btc;
  const ethEquivalent = usdBalance / cryptoPrices.eth;
  const ltcEquivalent = usdBalance / cryptoPrices.ltc;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Crypto Wallet</h1>
        <p className="text-muted-foreground">Manage your digital assets and trading portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">USD Balance</CardTitle>
            <DollarSign className="h-5 w-5 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${usdBalance.toFixed(2)}</div>
            <p className="text-xs opacity-90 mt-1">Total USD Balance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">BTC Equivalent</CardTitle>
            <Bitcoin className="h-5 w-5 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{btcEquivalent.toFixed(8)} BTC</div>
            <p className="text-xs opacity-90 mt-1">${cryptoPrices.btc.toFixed(2)} per BTC</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">ETH Equivalent</CardTitle>
            <Gem className="h-5 w-5 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ethEquivalent.toFixed(6)} ETH</div>
            <p className="text-xs opacity-90 mt-1">${cryptoPrices.eth.toFixed(2)} per ETH</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">LTC Equivalent</CardTitle>
            <TrendingUp className="h-5 w-5 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ltcEquivalent.toFixed(4)} LTC</div>
            <p className="text-xs opacity-90 mt-1">${cryptoPrices.ltc.toFixed(2)} per LTC</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-primary" />
            <CardTitle>KYC Verification Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-2">Identity Verification</p>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                ⚠️ {profile?.kyc_status === "pending" ? "Pending Review" : profile?.kyc_status || "Pending Review"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                Complete KYC verification to enable withdrawals and access all features.
              </p>
            </div>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              Complete KYC
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
