import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Inbox, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./theme-toggle";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Inbox", url: "/dashboard", icon: Inbox, count: 32 },
];

export function AppSidebar() {
  return (
    <Sidebar className="font-sans">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Questions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className=" mb-4 flex flex-row justify-end">
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
