'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function Footer() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleProtectedNav = (path) => {
    router.push(isLoggedIn ? path : '/signup');
  };

  return (
    <footer className="bg-background border-t border-yellow-500/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Sparkles className="w-6 h-6 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                NextGenAI
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering careers with AI-driven insights and personalized growth paths.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  Find Jobs
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleProtectedNav('/skills')}
                  className="text-left text-slate-400 hover:text-yellow-400 transition-colors text-sm"
                >
                  Skill Assessment
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleProtectedNav('/chat')}
                  className="text-left text-slate-400 hover:text-yellow-400 transition-colors text-sm"
                >
                  AI Career Coach
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-yellow-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-yellow-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-yellow-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} NextGenAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
