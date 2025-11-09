import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Withdraw = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdraw</h1>
        <p className="text-muted-foreground">Withdraw funds from your trading account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Withdrawal interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdraw;
