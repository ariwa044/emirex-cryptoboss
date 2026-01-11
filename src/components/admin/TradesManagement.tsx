import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pause, Play, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";

interface Trade {
  id: string;
  user_id: string;
  cryptocurrency: string;
  position_type: string;
  amount: number;
  entry_price: number;
  current_price: number;
  leverage: number;
  pnl: number;
  status: string;
  created_at: string;
}

interface User {
  user_id: string;
  username: string;
}

interface TradesManagementProps {
  users: User[];
  onActionComplete: () => void;
}

const TradesManagement = ({ users, onActionComplete }: TradesManagementProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [pnlAdjustment, setPnlAdjustment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrades();
    const channel = supabase
      .channel('admin-trades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        fetchTrades();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTrades(data);
    if (error) console.error("Error fetching trades:", error);
  };

  const logAdminAction = async (actionType: string, targetUserId: string, details: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: actionType,
      target_user_id: targetUserId,
      details: details
    });
  };

  const handlePauseTrade = async (trade: Trade) => {
    setLoading(true);
    try {
      const newStatus = trade.status === "open" ? "paused" : "open";
      const { error } = await supabase
        .from("trades")
        .update({ status: newStatus })
        .eq("id", trade.id);

      if (error) throw error;

      await logAdminAction(newStatus === "paused" ? "pause_trade" : "resume_trade", trade.user_id, {
        trade_id: trade.id,
        cryptocurrency: trade.cryptocurrency,
        position_type: trade.position_type
      });

      toast.success(`Trade ${newStatus === "paused" ? "paused" : "resumed"} successfully`);
      fetchTrades();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to update trade");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPnl = async () => {
    if (!editingTrade || !pnlAdjustment) return;
    setLoading(true);
    try {
      const adjustment = parseFloat(pnlAdjustment);
      const newPnl = (editingTrade.pnl || 0) + adjustment;

      const { error } = await supabase
        .from("trades")
        .update({ pnl: newPnl })
        .eq("id", editingTrade.id);

      if (error) throw error;

      await logAdminAction("adjust_trade_pnl", editingTrade.user_id, {
        trade_id: editingTrade.id,
        adjustment: adjustment,
        new_pnl: newPnl,
        action: "add"
      });

      toast.success(`Added $${adjustment.toFixed(2)} to trade PNL`);
      setEditingTrade(null);
      setPnlAdjustment("");
      fetchTrades();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust PNL");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtractPnl = async () => {
    if (!editingTrade || !pnlAdjustment) return;
    setLoading(true);
    try {
      const adjustment = parseFloat(pnlAdjustment);
      const newPnl = (editingTrade.pnl || 0) - adjustment;

      const { error } = await supabase
        .from("trades")
        .update({ pnl: newPnl })
        .eq("id", editingTrade.id);

      if (error) throw error;

      await logAdminAction("adjust_trade_pnl", editingTrade.user_id, {
        trade_id: editingTrade.id,
        adjustment: -adjustment,
        new_pnl: newPnl,
        action: "subtract"
      });

      toast.success(`Subtracted $${adjustment.toFixed(2)} from trade PNL`);
      setEditingTrade(null);
      setPnlAdjustment("");
      fetchTrades();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust PNL");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-success">Open</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const openTrades = trades.filter(t => t.status === "open" || t.status === "paused");

  return (
    <div className="space-y-6">
      <Card className="bg-admin-card border-admin-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-admin-primary" />
            Active Trades Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openTrades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active trades found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Crypto</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Leverage</TableHead>
                    <TableHead>PNL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">
                        {users.find(u => u.user_id === trade.user_id)?.username || 'Unknown'}
                      </TableCell>
                      <TableCell className="uppercase font-semibold">{trade.cryptocurrency}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${trade.position_type === 'long' ? 'text-success' : 'text-destructive'}`}>
                          {trade.position_type === 'long' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {trade.position_type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>${parseFloat(String(trade.amount)).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(String(trade.entry_price)).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(String(trade.current_price)).toFixed(2)}</TableCell>
                      <TableCell>{trade.leverage}x</TableCell>
                      <TableCell className={parseFloat(String(trade.pnl)) >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                        ${parseFloat(String(trade.pnl || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(trade.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={trade.status === "open" ? "secondary" : "default"}
                            onClick={() => handlePauseTrade(trade)}
                            disabled={loading}
                          >
                            {trade.status === "open" ? (
                              <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTrade(trade)}
                          >
                            Adjust PNL
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PNL Adjustment Dialog */}
      <Dialog open={!!editingTrade} onOpenChange={(open) => !open && setEditingTrade(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Trade PNL</DialogTitle>
          </DialogHeader>
          {editingTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">User:</span>
                  <p className="font-medium">{users.find(u => u.user_id === editingTrade.user_id)?.username}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Crypto:</span>
                  <p className="font-medium uppercase">{editingTrade.cryptocurrency}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <p className="font-medium">{editingTrade.position_type.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current PNL:</span>
                  <p className={`font-medium ${parseFloat(String(editingTrade.pnl)) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${parseFloat(String(editingTrade.pnl || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={pnlAdjustment}
                  onChange={(e) => setPnlAdjustment(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingTrade(null);
                setPnlAdjustment("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubtractPnl}
              disabled={loading || !pnlAdjustment}
            >
              <Minus className="h-4 w-4 mr-1" />
              Subtract
            </Button>
            <Button
              className="bg-success hover:bg-success/80"
              onClick={handleAddPnl}
              disabled={loading || !pnlAdjustment}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradesManagement;
