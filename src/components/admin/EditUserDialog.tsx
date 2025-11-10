import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditUserDialog = ({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usd_balance: user?.usd_balance || 0,
    btc_wallet_address: user?.btc_wallet_address || "",
    eth_wallet_address: user?.eth_wallet_address || "",
    ltc_wallet_address: user?.ltc_wallet_address || "",
  });
  const [fundAmount, setFundAmount] = useState("");

  const handleAddFunds = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    setFormData(prev => ({
      ...prev,
      usd_balance: parseFloat(String(prev.usd_balance)) + amount
    }));
    setFundAmount("");
    toast.success(`Added $${amount.toFixed(2)} to balance`);
  };

  const handleSubtractFunds = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newBalance = parseFloat(String(formData.usd_balance)) - amount;
    if (newBalance < 0) {
      toast.error("Insufficient balance");
      return;
    }
    setFormData(prev => ({
      ...prev,
      usd_balance: newBalance
    }));
    setFundAmount("");
    toast.success(`Subtracted $${amount.toFixed(2)} from balance`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          usd_balance: formData.usd_balance,
          btc_wallet_address: formData.btc_wallet_address.trim() || null,
          eth_wallet_address: formData.eth_wallet_address.trim() || null,
          ltc_wallet_address: formData.ltc_wallet_address.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("User updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user?.username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance Management */}
          <div className="space-y-2">
            <Label>Current Balance</Label>
            <div className="text-2xl font-bold text-primary">
              ${parseFloat(String(formData.usd_balance)).toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundAmount">Add/Subtract Funds</Label>
            <div className="flex gap-2">
              <Input
                id="fundAmount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
              <Button onClick={handleAddFunds} variant="default" size="sm">
                Add
              </Button>
              <Button onClick={handleSubtractFunds} variant="destructive" size="sm">
                Subtract
              </Button>
            </div>
          </div>

          {/* Crypto Wallet Addresses */}
          <div className="space-y-2">
            <Label htmlFor="btc_wallet">BTC Wallet Address</Label>
            <Input
              id="btc_wallet"
              type="text"
              placeholder="Enter Bitcoin wallet address"
              value={formData.btc_wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, btc_wallet_address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eth_wallet">ETH Wallet Address</Label>
            <Input
              id="eth_wallet"
              type="text"
              placeholder="Enter Ethereum wallet address"
              value={formData.eth_wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, eth_wallet_address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ltc_wallet">LTC Wallet Address</Label>
            <Input
              id="ltc_wallet"
              type="text"
              placeholder="Enter Litecoin wallet address"
              value={formData.ltc_wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, ltc_wallet_address: e.target.value }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
