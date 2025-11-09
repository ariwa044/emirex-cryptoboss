import { LayoutDashboard, TrendingUp, Wallet, ArrowDownToLine, History, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Waves } from "lucide-react";
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

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Trade", url: "/dashboard/trade", icon: TrendingUp },
  { title: "Deposit", url: "/dashboard/deposit", icon: Wallet },
  { title: "Withdraw", url: "/dashboard/withdraw", icon: ArrowDownToLine },
  { title: "History", url: "/dashboard/history", icon: History },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-border bg-[hsl(263,70%,20%)]">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
            <Waves className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">PrimeWave Global</h1>
              <p className="text-xs text-white/70">Crypto Trading Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50 px-6">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-white/10">
                    <NavLink
                      to={item.url}
                      end
                      className="text-white/80 hover:text-white px-6 py-3"
                      activeClassName="bg-white/20 text-white font-medium"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
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
