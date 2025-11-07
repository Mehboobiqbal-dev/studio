'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
    Gauge,
    MessageSquareQuote,
    Swords,
    Trophy,
    Hourglass,
    ShieldCheck,
} from "lucide-react";

const navItems = [
    {
        href: "/dashboard",
        icon: MessageSquareQuote,
        label: "Echo Chamber",
    },
    {
        href: "/analytics",
        icon: Gauge,
        label: "Analytics",
    },
    {
        href: "/arenas",
        icon: Swords,
        label: "Arenas",
    },
    {
        href: "/tournaments",
        icon: Trophy,
        label: "Tournaments",
    },
    {
        href: "/time-capsule",
        icon: Hourglass,
        label: "Time Capsule",
    },
    {
        href: "/moderation",
        icon: ShieldCheck,
        label: "Moderation",
    },
];

export function SidebarNav() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                        <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
