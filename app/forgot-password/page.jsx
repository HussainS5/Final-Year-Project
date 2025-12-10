'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Sparkles, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error('Failed to send reset email', {
          description: error.message || 'Please check your email address and try again.',
        });
        setLoading(false);
        return;
      }

      setEmailSent(true);
      toast.success('Password reset email sent!', {
        description: 'Please check your inbox for instructions to reset your password.',
      });
    } catch (error) {
      toast.error('An error occurred', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              NextGenAI
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-slate-400">
            {emailSent
              ? 'Check your email for reset instructions'
              : 'Enter your email address and we\'ll send you a link to reset your password'}
          </p>
        </div>

        <Card className="glass-card p-8">
          {emailSent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Email Sent Successfully!
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-slate-500 text-xs">
                  Please check your inbox and click the link to reset your password. The link will expire in 1 hour.
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
                >
                  Send Another Email
                </Button>
                <Link href="/login" className="block">
                  <Button
                    variant="ghost"
                    className="w-full hover:bg-yellow-500/10 hover:text-yellow-400"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12 glass-card text-white placeholder:text-slate-500 border-yellow-500/20 focus:border-yellow-500/50"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  We'll send you a secure link to reset your password
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold text-base transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-yellow-400 hover:text-yellow-300">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

