import { LayoutDashboard, TrendingUp, ArrowDownToLine, ArrowUpFromLine, History, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Trade", url: "/dashboard/trade", icon: TrendingUp },
  { title: "Deposit", url: "/dashboard/deposit", icon: ArrowDownToLine },
  { title: "Withdraw", url: "/dashboard/withdraw", icon: ArrowUpFromLine },
  { title: "History", url: "/dashboard/history", icon: History },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function DashboardSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar 
      className="border-r border-border bg-background"
    >
      <SidebarContent className="bg-background">
        <div className="p-6 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground">
            Fintrix Trade
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Crypto Trading Platform</p>
        </div>

        <SidebarGroup className="bg-background">
          <SidebarGroupLabel className="text-foreground font-semibold px-4 py-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/80 transition-colors text-foreground font-medium"
                      activeClassName="bg-primary/20 text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && <span className="text-base">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
