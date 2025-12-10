'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Sparkles, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

function Verify2FAForm() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL params or session (run only once)
    if (otpSent) return; // Prevent duplicate sends
    
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      sendOTP(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
      sendOTP(user.email);
    } else {
      const storedSession = sessionStorage.getItem('pending_2fa_session');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        setEmail(sessionData.user?.email || '');
        if (sessionData.user?.email) {
          sendOTP(sessionData.user.email);
        }
      } else {
        toast.error('Email not found', {
          description: 'Please login again.',
        });
        router.push('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const sendOTP = async (userEmail) => {
    // Prevent duplicate sends
    if (sendingOtp || otpSent) {
      return;
    }

    setSendingOtp(true);
    try {
      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in session storage temporarily
      sessionStorage.setItem('login_2fa_otp', generatedOtp);
      sessionStorage.setItem('login_2fa_otp_time', Date.now().toString());
      sessionStorage.setItem('login_2fa_email', userEmail);

      // Send OTP via backend API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/email/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          otp: generatedOtp,
          type: '2fa_login'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success('OTP sent to your email', {
        description: 'Please check your inbox for the 6-digit code.',
      });

      setOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Invalid OTP', {
        description: 'Please enter a valid 6-digit code.',
      });
      return;
    }

    setLoading(true);
    try {
      const storedOtp = sessionStorage.getItem('login_2fa_otp');
      const otpTime = parseInt(sessionStorage.getItem('login_2fa_otp_time') || '0');
      const storedEmail = sessionStorage.getItem('login_2fa_email');
      const now = Date.now();
      
      // OTP expires after 10 minutes
      if (now - otpTime > 10 * 60 * 1000) {
        toast.error('OTP expired', {
          description: 'Please request a new OTP code.',
        });
        setOtpSent(false);
        setOtp('');
        sessionStorage.removeItem('login_2fa_otp');
        sessionStorage.removeItem('login_2fa_otp_time');
        sessionStorage.removeItem('login_2fa_email');
        setLoading(false);
        return;
      }

      if (otp !== storedOtp || email !== storedEmail) {
        toast.error('Invalid OTP', {
          description: 'The code you entered does not match. Please try again.',
        });
        setLoading(false);
        return;
      }

      // Clear OTP from storage
      sessionStorage.removeItem('login_2fa_otp');
      sessionStorage.removeItem('login_2fa_otp_time');
      sessionStorage.removeItem('login_2fa_email');

      // Get the stored session from login
      const storedSession = sessionStorage.getItem('pending_2fa_session');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        await login(sessionData.user, sessionData.session);
        sessionStorage.removeItem('pending_2fa_session');
      }

      toast.success('Login successful!', {
        description: '2FA verification completed.',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.error('An error occurred', {
        description: error.message || 'Please try again later.',
      });
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpSent(false);
    setOtp('');
    await sendOTP(email);
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
            Verify 2FA Code
          </h1>
          <p className="text-slate-400">
            Enter the code sent to your email
          </p>
        </div>

        <Card className="glass-card p-8">
          {!otpSent ? (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto" />
              <p className="text-slate-400">Sending OTP to {email}...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-slate-400 text-sm">
                    We sent a 6-digit code to <strong className="text-white">{email}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-300">
                  Enter Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50 text-center text-2xl tracking-widest h-16"
                  autoFocus
                />
                <p className="text-xs text-slate-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 mr-2" />
                    Verify & Continue
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={sendingOtp}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  {sendingOtp ? 'Sending...' : "Didn't receive code? Resend"}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function Verify2FA() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    }>
      <Verify2FAForm />
    </Suspense>
  );
}

