import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, DollarSign, TrendingUp, LogOut, Edit, LayoutDashboard, History, ArrowDownCircle, ArrowUpCircle, CheckCircle, XCircle } from "lucide-react";
import { EditUserDialog } from "@/components/admin/EditUserDialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminActions, setAdminActions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalInvestments: 0,
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    checkAdminAccess();
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const setupRealtimeSubscriptions = () => {
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('admin-transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  };

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast.error("Access denied");
      navigate("/admin/login");
    }
  };

  const fetchData = async () => {
    // Fetch all profiles with user emails
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*");

    if (profilesData) {
      // Fetch user emails from auth.users
      const userPromises = profilesData.map(async (profile) => {
        const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
        return { ...profile, email: user?.email || 'N/A' };
      });
      
      const usersWithEmails = await Promise.all(userPromises);
      setUsers(usersWithEmails);
      
      const totalBalance = profilesData.reduce((sum, p) => sum + (parseFloat(String(p.usd_balance)) || 0), 0);
      setStats(prev => ({ ...prev, totalUsers: profilesData.length, totalBalance }));
    }

    // Fetch all transactions
    const { data: transactionsData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (transactionsData) setTransactions(transactionsData);

    // Fetch investments
    const { data: investmentsData } = await supabase
      .from("investments")
      .select("amount");

    if (investmentsData) {
      const totalInvestments = investmentsData.reduce((sum, i) => sum + parseFloat(String(i.amount)), 0);
      setStats(prev => ({ ...prev, totalInvestments }));
    }

    // Fetch admin actions
    const { data: actionsData } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (actionsData) setAdminActions(actionsData);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
    toast.success("Signed out successfully");
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData();
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

  const handleApproveTransaction = async (transaction: any) => {
    try {
      // Update transaction status
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", transaction.id);

      if (txError) throw txError;

      // Determine the balance field based on currency
      const currencyMap: Record<string, string> = {
        BTC: "btc_balance",
        ETH: "eth_balance",
        LTC: "ltc_balance",
        USD: "usd_balance",
      };

      const balanceField = currencyMap[transaction.currency] || "usd_balance";

      // Update user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select(`${balanceField}`)
        .eq("user_id", transaction.user_id)
        .single();

      if (profile) {
        const currentBalance = parseFloat(String(profile[balanceField]));
        const transactionAmount = parseFloat(String(transaction.amount));
        const newBalance = transaction.type === "deposit" 
          ? currentBalance + transactionAmount 
          : currentBalance - transactionAmount;

        if (newBalance < 0) {
          toast.error("Insufficient balance for withdrawal");
          return;
        }

        const { error: balanceError } = await supabase
          .from("profiles")
          .update({ [balanceField]: newBalance })
          .eq("user_id", transaction.user_id);

        if (balanceError) throw balanceError;
      }

      // Log admin action
      await logAdminAction("approve_transaction", transaction.user_id, {
        transaction_id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency
      });

      toast.success(`${transaction.currency} transaction approved successfully`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve transaction");
    }
  };

  const handleRejectTransaction = async (transaction: any) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);

      if (error) throw error;

      // Log admin action
      await logAdminAction("reject_transaction", transaction.user_id, {
        transaction_id: transaction.id,
        type: transaction.type,
        amount: transaction.amount
      });

      toast.success(`Transaction rejected`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject transaction");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-admin-secondary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-admin-sidebar text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "dashboard" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "transactions" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <ArrowDownCircle className="h-5 w-5" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "history" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <History className="h-5 w-5" />
              Admin History
            </button>
          </nav>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full mt-8 bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-admin-card border-admin-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-admin-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card className="bg-admin-card border-admin-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                  <DollarSign className="h-5 w-5 text-admin-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">${stats.totalBalance.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="bg-admin-card border-admin-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Investments</CardTitle>
                  <TrendingUp className="h-5 w-5 text-admin-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">${stats.totalInvestments.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-admin-card border-admin-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>USD</TableHead>
                        <TableHead>BTC</TableHead>
                        <TableHead>ETH</TableHead>
                        <TableHead>LTC</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="font-semibold text-admin-accent">${parseFloat(user.usd_balance).toFixed(2)}</TableCell>
                          <TableCell className="font-semibold text-admin-accent">{parseFloat(user.btc_balance || 0).toFixed(8)}</TableCell>
                          <TableCell className="font-semibold text-admin-accent">{parseFloat(user.eth_balance || 0).toFixed(8)}</TableCell>
                          <TableCell className="font-semibold text-admin-accent">{parseFloat(user.ltc_balance || 0).toFixed(8)}</TableCell>
                          <TableCell className="font-semibold text-success">${parseFloat(user.profit_balance || 0).toFixed(2)}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleEditUser(user)}
                              className="bg-admin-primary hover:bg-admin-accent"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Transaction Management</h2>
            
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Card className="bg-admin-card border-admin-primary/20">
                  <CardHeader>
                    <CardTitle className="text-foreground">Pending Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.filter(t => t.status === "pending").map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="capitalize font-medium">
                              {transaction.type === "deposit" ? (
                                <span className="flex items-center gap-2 text-success">
                                  <ArrowDownCircle className="h-4 w-4" />
                                  Deposit
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-destructive">
                                  <ArrowUpCircle className="h-4 w-4" />
                                  Withdrawal
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold">${parseFloat(transaction.amount).toFixed(2)}</TableCell>
                            <TableCell>{transaction.currency}</TableCell>
                            <TableCell>{users.find(u => u.user_id === transaction.user_id)?.username || 'Unknown'}</TableCell>
                            <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveTransaction(transaction)}
                                  className="bg-success hover:bg-success/80"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectTransaction(transaction)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed">
                <Card className="bg-admin-card border-admin-primary/20">
                  <CardHeader>
                    <CardTitle className="text-foreground">Completed Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.filter(t => t.status === "completed").map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="capitalize">{transaction.type}</TableCell>
                            <TableCell className="font-semibold">${parseFloat(transaction.amount).toFixed(2)}</TableCell>
                            <TableCell>{transaction.currency}</TableCell>
                            <TableCell>{users.find(u => u.user_id === transaction.user_id)?.username || 'Unknown'}</TableCell>
                            <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="default">Completed</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="failed">
                <Card className="bg-admin-card border-admin-primary/20">
                  <CardHeader>
                    <CardTitle className="text-foreground">Failed Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.filter(t => t.status === "failed").map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="capitalize">{transaction.type}</TableCell>
                            <TableCell className="font-semibold">${parseFloat(transaction.amount).toFixed(2)}</TableCell>
                            <TableCell>{transaction.currency}</TableCell>
                            <TableCell>{users.find(u => u.user_id === transaction.user_id)?.username || 'Unknown'}</TableCell>
                            <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">Failed</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Admin Action History</h2>
            
            <Card className="bg-admin-card border-admin-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="capitalize font-medium">{action.action_type.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <pre className="text-xs">{JSON.stringify(action.details, null, 2)}</pre>
                        </TableCell>
                        <TableCell>{new Date(action.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
