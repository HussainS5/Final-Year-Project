import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { Navigation } from '@/components/Navigation';
import { FloatingParticles } from '@/components/FloatingParticles';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NextGenAI - AI Career Platform',
  description: 'Modern AI-powered career platform for job recommendations and skill development',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <FloatingParticles />
              <Navigation />
              <main className="relative z-10 pt-16">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
