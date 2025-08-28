"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

type AdminSidebarProps = {
  children: ReactNode;
};

export function AdminSidebar({ children }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logoutMutation } = useAdminAuth();

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/advertisers", label: "Advertisers", icon: Building2 },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/payouts", label: "Payouts", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-6 rounded bg-primary" />
            <span className="font-semibold">KudiTask Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname?.startsWith(item.href) ?? false;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton isActive={isActive}>
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{(user?.name.charAt(0))}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium leading-4 truncate max-w-[10rem]">
                  {user?.name ?? "Admin"}
                </div>
                <div className="text-xs text-muted-foreground leading-4 truncate max-w-[10rem]">
                  {user?.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="flex h-12 items-center gap-2 border-b px-3 md:px-4">
          <SidebarTrigger />
          <div className="font-medium">{navItems.find(n => pathname?.startsWith(n.href))?.label ?? "Admin"}</div>
        </div>
        <div className="">{children}</div>
        {/* <div className="p-3 md:p-6">{children}</div> */}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminSidebar;


