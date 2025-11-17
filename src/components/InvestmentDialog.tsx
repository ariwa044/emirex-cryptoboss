import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar, TrendingUp, Wallet } from "lucide-react";

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    name: string;
    dailyRate: string;
    minInvest: string;
    maxInvest: string;
    duration: string;
    features: string[];
    color: string;
    border: string;
  } | null;
  balance: number;
  onConfirm: (days: number) => void;
}

const InvestmentDialog = ({ open, onOpenChange, plan, balance, onConfirm }: InvestmentDialogProps) => {
  const maxDays = plan ? parseInt(plan.duration.split(' ')[0]) : 30;
  const [selectedDays, setSelectedDays] = useState(maxDays);

  if (!plan) return null;

  const dailyRate = parseFloat(plan.dailyRate.replace('%', '')) / 100;
  const projectedProfit = balance * dailyRate * selectedDays;
  const totalReturn = balance + projectedProfit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Investment</DialogTitle>
          <DialogDescription>
            Review your investment details and select the duration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Info */}
          <div className={`p-4 rounded-lg bg-gradient-to-br ${plan.color} ${plan.border} border-2`}>
            <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{plan.dailyRate} Daily Returns</span>
            </div>
          </div>

          {/* Investment Amount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Investment Amount
            </Label>
            <div className="text-3xl font-bold text-primary">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Duration
            </Label>
            <div className="space-y-2">
              <Slider
                value={[selectedDays]}
                onValueChange={(value) => setSelectedDays(value[0])}
                min={7}
                max={maxDays}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>7 days</span>
                <span className="font-bold text-primary text-lg">{selectedDays} days</span>
                <span>{maxDays} days</span>
              </div>
            </div>
          </div>

          {/* Projected Returns */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Daily Profit</span>
              <span className="font-semibold text-green-500">
                +${(balance * dailyRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Profit ({selectedDays} days)</span>
              <span className="font-semibold text-green-500">
                +${projectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Return</span>
              <span className="font-bold text-primary text-xl">
                ${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(selectedDays)}>
            Confirm Investment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDialog;
