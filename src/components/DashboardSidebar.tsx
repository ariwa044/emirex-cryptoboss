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
    <Sidebar className="border-r border-border bg-gradient-to-b from-primary/10 to-background">
      <SidebarContent>
        <div className="p-6">
          <h2 className="text-xl font-bold">
            <span className="text-primary">PrimeWave</span>{" "}
            <span className="text-foreground">Global</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Crypto Trading Platform</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/20 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
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
