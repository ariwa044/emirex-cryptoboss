import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Trade = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trade</h1>
        <p className="text-muted-foreground">Execute trades and manage your portfolio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trading Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Trading interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Trade;
