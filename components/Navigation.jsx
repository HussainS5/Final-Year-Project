'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, logout } = useAuth();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/skills', label: 'Skills' },
    { href: '/ats', label: 'ATS' },
    { href: '/chat', label: 'AI Chat' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <Sparkles className="w-6 h-6 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              NextGenAI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {isLoggedIn && links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${pathname === link.href
                  ? 'bg-yellow-500/20 text-yellow-400 font-medium'
                  : 'text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/10'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="hover:bg-yellow-500/10 hover:text-yellow-400 transition-all duration-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold transition-all hover:scale-105"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={logout}
                className="hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
              >
                Logout
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-yellow-500/10 hover:text-yellow-400 transition-all duration-300 hover:scale-110"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
