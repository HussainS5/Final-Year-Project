'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Sparkles, Loader2, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export default function Enable2FA() {
  const router = useRouter();
  const { user } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Automatically send OTP when page loads (only once)
    if (user?.email && !otpSent && !verified) {
      sendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const sendOTP = async () => {
    if (!user?.email) {
      toast.error('User email not found', {
        description: 'Please login again to enable 2FA.',
      });
      router.push('/login');
      return;
    }

    // Prevent duplicate sends
    if (sendingOtp || otpSent) {
      return;
    }

    setSendingOtp(true);
    try {
      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in session storage temporarily
      sessionStorage.setItem('2fa_otp', generatedOtp);
      sessionStorage.setItem('2fa_otp_time', Date.now().toString());

      // Send OTP via backend API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/email/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          otp: generatedOtp,
          type: '2fa_enable'
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
      const storedOtp = sessionStorage.getItem('2fa_otp');
      const otpTime = parseInt(sessionStorage.getItem('2fa_otp_time') || '0');
      const now = Date.now();
      
      // OTP expires after 10 minutes
      if (now - otpTime > 10 * 60 * 1000) {
        toast.error('OTP expired', {
          description: 'Please request a new OTP code.',
        });
        setOtpSent(false);
        setOtp('');
        sessionStorage.removeItem('2fa_otp');
        sessionStorage.removeItem('2fa_otp_time');
        setLoading(false);
        return;
      }

      if (otp !== storedOtp) {
        toast.error('Invalid OTP', {
          description: 'The code you entered does not match. Please try again.',
        });
        setLoading(false);
        return;
      }

      // Store 2FA status in user metadata or a separate table
      // For now, we'll use Supabase user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          mfa_enabled: true,
          mfa_enabled_at: new Date().toISOString(),
        }
      });

      if (updateError) {
        toast.error('Failed to enable 2FA', {
          description: updateError.message || 'Please try again.',
        });
        setLoading(false);
        return;
      }

      // Clear OTP from storage
      sessionStorage.removeItem('2fa_otp');
      sessionStorage.removeItem('2fa_otp_time');

      setVerified(true);
      toast.success('2FA enabled successfully!', {
        description: 'Two-factor authentication is now active on your account.',
      });

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
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
    await sendOTP();
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">2FA Enabled Successfully!</h2>
            <p className="text-slate-400 mb-6">Redirecting to your profile...</p>
            <Loader2 className="w-6 h-6 text-yellow-500 animate-spin mx-auto" />
          </Card>
        </div>
      </div>
    );
  }

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
            Enable Two-Factor Authentication
          </h1>
          <p className="text-slate-400">
            We'll send a verification code to your email
          </p>
        </div>

        <Card className="glass-card p-8">
          {!otpSent ? (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Setting up 2FA
                  </h3>
                  <p className="text-slate-400 text-sm">
                    We're sending a 6-digit code to <strong className="text-white">{user?.email}</strong>
                  </p>
                </div>
              </div>
              <Button
                onClick={sendOTP}
                disabled={sendingOtp}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send OTP to Email
                  </>
                )}
              </Button>
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
                    We sent a 6-digit code to <strong className="text-white">{user?.email}</strong>
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
                    Verify & Enable 2FA
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

          <div className="mt-6 text-center">
            <Link
              href="/profile"
              className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

