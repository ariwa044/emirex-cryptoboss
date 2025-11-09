import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DashboardContext {
  user: User;
  profile: Profile | null;
}

const Profile = () => {
  const { user, profile } = useOutletContext<DashboardContext>();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={profile?.username || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={profile?.role || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>KYC Status</Label>
            <Input value={profile?.kyc_status || ""} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
