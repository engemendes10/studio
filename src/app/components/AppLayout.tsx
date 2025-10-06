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

function MobileHeader() {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} >
                <PanelLeft />
                <span className="sr-only">Alternar barra lateral</span>
            </Button>
            <div className="flex-1">
                <AppLogo />
            </div>
        </header>
    )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <DesktopSidebar />
      <div className="flex flex-col md:pl-[3rem]">
        <header className="sticky top-0 z-10 hidden h-14 items-center gap-4 border-b bg-background px-4 md:flex">
             <h1 className="flex-1 text-xl font-headline text-primary">
              {navItems.find(item => item.href === pathname)?.label}
            </h1>
        </header>
        <SidebarInset className="bg-muted/40">
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
