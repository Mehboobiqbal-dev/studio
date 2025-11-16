import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { MainNav } from '@/components/main-nav';

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  weight: ['600', '700'],
});


export const metadata: Metadata = {
  title: 'ConspiracyHub - Conspiracy Theories & Opinions Platform',
  description: 'Explore conspiracy theories and opinions on current and historical topics. AI-generated and user-submitted content.',
  keywords: ['conspiracy theories', 'opinions', 'debate', 'discussion', 'current events', 'history'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ConspiracyHub',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontBody.variable, fontHeadline.variable)}>
        <AuthProvider>
          <MainNav />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
