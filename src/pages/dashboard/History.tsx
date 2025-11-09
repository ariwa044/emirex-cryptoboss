import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Trade {
  id: string;
  cryptocurrency: string;
  position_type: string;
  entry_price: number;
  current_price: number;
  amount: number;
  leverage: number;
  pnl: number;
  status: string;
  created_at: string;
  closed_at: string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  btc_address: string | null;
  narration: string | null;
  created_at: string;
}

const History = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all trades
      const { data: tradesData } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch all transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTrades(tradesData || []);
      setTransactions(transactionsData || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
      case "pending":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-400";
      case "closed":
      case "completed":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-2">View all your trades and transactions</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="transactions">Deposits/Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                All Activity
              </h3>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading history...</p>
              ) : trades.length === 0 && transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {[...transactions.map(t => ({ ...t, type: 'transaction' })), ...trades.map(t => ({ ...t, type: 'trade' }))]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${item.type === 'transaction' 
                            ? item.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                            : item.position_type === 'long' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {item.type === 'transaction' ? (
                              item.type === 'deposit' ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />
                            ) : item.position_type === 'long' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.type === 'transaction' 
                                ? `${item.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${item.currency}`
                                : `${item.cryptocurrency} ${item.position_type === 'long' ? 'Long' : 'Short'} ${item.leverage}x`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            {item.type === 'transaction' ? `$${item.amount}` : `$${item.amount} @ $${item.entry_price}`}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead>PNL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Loading trades...</TableCell>
                  </TableRow>
                ) : trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No trades yet
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.cryptocurrency}</TableCell>
                      <TableCell>
                        <Badge variant={trade.position_type === 'long' ? 'default' : 'destructive'}>
                          {trade.position_type}
                        </Badge>
                      </TableCell>
                      <TableCell>${trade.entry_price.toLocaleString()}</TableCell>
                      <TableCell>${trade.amount.toFixed(2)}</TableCell>
                      <TableCell>{trade.leverage}x</TableCell>
                      <TableCell className={trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        ${trade.pnl.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(trade.status)}>{trade.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading transactions...</TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {transaction.narration || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
