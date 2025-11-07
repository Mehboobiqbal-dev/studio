import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Logo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Logo className="size-8 text-primary" />
                        <span className="font-headline text-lg text-sidebar-foreground">Bias Buster</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarNav />
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                            <AvatarImage src="https://picsum.photos/seed/101/100/100" alt="User Avatar" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-sidebar-foreground">User</span>
                            <span className="text-xs text-sidebar-foreground/70">user@email.com</span>
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="font-headline text-xl">Bias Buster Arena</h1>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
