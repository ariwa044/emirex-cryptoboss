import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DemoSidebar } from "@/components/DemoSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const DemoDashboard = () => {
  const navigate = useNavigate();

  const handleExitDemo = () => {
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DemoSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-xl flex items-center justify-between px-6 shadow-lg">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
              <div>
                <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">Demo Account</h1>
                <p className="text-sm text-muted-foreground">Practice Trading with $100,000</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleExitDemo} className="hover:bg-destructive/10 hover:text-destructive transition-all">
                <LogOut className="h-5 w-5" />
              </Button>
              <Avatar className="ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  D
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gradient-hero overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DemoDashboard;
