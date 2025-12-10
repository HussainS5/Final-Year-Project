'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Briefcase, TrendingUp, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ResumeUploadModal } from '@/components/ResumeUploadModal';
import { ProfileReviewModal } from '@/components/ProfileReviewModal';
import { useAuth } from '@/components/AuthProvider';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: 12547, suffix: '+' },
    { icon: Users, label: 'Active Users', value: 89432, suffix: '+' },
    { icon: TrendingUp, label: 'Success Rate', value: 94, suffix: '%' },
  ];

  const handleUploadSuccess = (result) => {
    if (result && result.data) {
      setParsedData(result.data);
      setResumeId(result.resume_id);
      setShowReviewModal(true);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">AI-Powered Career Intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight animate-fade-in-up">
            <span className="gradient-text glow-text">Transform Your Career</span>
            <br />
            <span className="text-foreground">With AI Precision</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Upload your resume and let our advanced AI match you with perfect opportunities,
            identify skill gaps, and accelerate your career growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              onClick={() => {
                if (isLoggedIn) {
                  setShowUploadModal(true);
                } else {
                  router.push('/signup');
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Resume
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/signup')}
              className="glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-foreground px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
            >
              Explore Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20 group"
              >
                <stat.icon className="w-8 h-8 text-yellow-500 mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-3xl font-bold gradient-text mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="gradient-text">How It Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Resume',
                description: 'Simply upload your resume and let our AI analyze your skills, experience, and career goals.',
              },
              {
                step: '02',
                title: 'Get Matched',
                description: 'Our algorithm finds the perfect job opportunities tailored to your unique profile.',
              },
              {
                step: '03',
                title: 'Grow Skills',
                description: 'Identify skill gaps and receive personalized recommendations to advance your career.',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="glass-card p-8 hover:scale-105 transition-all duration-300 group hover:shadow-xl hover:shadow-yellow-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl font-bold text-yellow-500/20 mb-4 group-hover:text-yellow-500/40 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ResumeUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />

      {user && (
        <ProfileReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          parsedData={parsedData}
          userId={user.user_id}
          resumeId={resumeId}
        />
      )}

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
