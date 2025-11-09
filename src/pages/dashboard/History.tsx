import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const History = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">View your transaction and trading history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Transaction history coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
