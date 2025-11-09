import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Deposit = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit</h1>
        <p className="text-muted-foreground">Add funds to your trading account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Deposit interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;
