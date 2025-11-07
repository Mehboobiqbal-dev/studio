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
    Users,
    Code,
    LineChart,
    Store,
} from "lucide-react";

const navItems = [
    {
        href: "/dashboard",
        icon: MessageSquareQuote,
        label: "Simulator",
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
        href: "/guilds",
        icon: Users,
        label: "Guilds",
    },
    {
        href: "/time-capsules",
        icon: Hourglass,
        label: "Time Capsules",
    },
    {
        href: "/analytics",
        icon: Gauge,
        label: "Analytics",
    },
    {
        href: "/moderation",
        icon: ShieldCheck,
        label: "Moderation",
    },
    {
        href: "/sdks",
        icon: Code,
        label: "SDKs & API",
    },
    {
        href: "/insights",
        icon: LineChart,
        label: "Insights",
    },
    {
        href: "/marketplace",
        icon: Store,
        label: "Marketplace",
    },
];

export function SidebarNav() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                        className="text-base"
                    >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
