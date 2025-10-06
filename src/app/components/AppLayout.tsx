
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  ListChecks,
  PlusSquare,
  User,
  PanelLeft,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/lancamentos", label: "Lançamentos", icon: PlusSquare },
  { href: "/atividades", label: "Atividades", icon: ListChecks },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/meus-dados", label: "Meus Dados", icon: User },
];

function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <BarChart3 className="h-7 w-7 text-sidebar-foreground" />
      <span className="font-headline text-xl font-bold text-sidebar-foreground">
        ProdutiviNet
      </span>
    </Link>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  return (
    <Sidebar collapsible="icon" className="hidden border-r-0 md:flex">
      <SidebarHeader>
        <div className="flex h-10 items-center justify-center p-2 group-data-[collapsible=icon]:justify-center">
            <div className="group-data-[collapsible=icon]:hidden">
                <AppLogo />
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
                 <BarChart3 className="h-7 w-7 text-sidebar-foreground" />
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={state === "collapsed" ? item.label : undefined}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}


function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground",
              pathname === item.href ? "text-primary bg-muted" : "hover:bg-muted/50"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const mainDivClass = cn(
        "flex flex-col",
        mounted && "md:pl-[3rem] pb-16 md:pb-0"
    );

    return (
        <>
            {mounted && <DesktopSidebar />}
            <div className={mainDivClass}>
                <header className="sticky top-0 z-10 hidden h-14 items-center gap-4 border-b bg-background px-4 md:flex">
                    <h1 className="flex-1 text-xl font-headline text-primary">
                        {navItems.find(item => item.href === pathname)?.label}
                    </h1>
                </header>
                <SidebarInset className="bg-muted/40">
                    {children}
                </SidebarInset>
            </div>
            <MobileBottomNav />
        </>
    )
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
