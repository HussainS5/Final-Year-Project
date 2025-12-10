'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RefreshCw, AlertTriangle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

const scoreToColor = (score) => {
  if (score >= 80) return 'from-green-400 to-emerald-500';
  if (score >= 60) return 'from-yellow-400 to-amber-500';
  return 'from-rose-400 to-red-500';
};

export default function ATS() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFetched = useRef(false);

  const loadExisting = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAtsReportLatest(user.user_id);
      setReport(data);
      return true;
    } catch (err) {
      setReport(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAtsReport(user.user_id);
      const sanitizeText = (text) =>
        (text || '')
          .replace(/\*\*/g, '') // strip markdown bold markers
          .replace(/\s+/g, ' ')
          .trim();
      const sanitizeList = (list) => (Array.isArray(list) ? list.map((item) => sanitizeText(item)) : []);

      setReport({
        ...data,
        summary: sanitizeText(data.summary),
        strengths: sanitizeList(data.strengths),
        gaps: sanitizeList(data.gaps),
        recommendations: sanitizeList(data.recommendations),
        keywordsToAdd: sanitizeList(data.keywordsToAdd),
      });
    } catch (err) {
      setError(err.message || 'Failed to load ATS report');
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/signup');
      return;
    }
    if (user?.user_id && !hasFetched.current) {
      hasFetched.current = true;
      (async () => {
        const gotExisting = await loadExisting();
        if (!gotExisting) {
          await fetchReport();
        }
      })();
    }
  }, [isLoggedIn, user, router, fetchReport, loadExisting]);

  const breakdownEntries = useMemo(() => {
    if (!report?.breakdown) return [];
    return [
      { label: 'Skills', value: report.breakdown.skills },
      { label: 'Experience', value: report.breakdown.experience },
      { label: 'Education', value: report.breakdown.education },
      { label: 'Profile Completeness', value: report.breakdown.profileCompleteness },
    ];
  }, [report]);

  const courseKeywords = useMemo(() => {
    if (!report?.keywordsToAdd?.length) return [];
    // de-dupe and limit to top 8 for display
    const uniq = Array.from(new Set(report.keywordsToAdd.map((k) => k.trim()).filter(Boolean)));
    return uniq.slice(0, 8);
  }, [report]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-yellow-400 uppercase tracking-[0.2em] mb-1">ATS Insights</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-yellow-400" />
              ATS Score & Recommendations
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              We analyze your profile using the same Gemini model as the AI coach and generate a recruiter-friendly score,
              breakdown, and targeted improvements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchReport}
              disabled={loading}
              className="glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
            >
              View Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 border border-red-500/30 bg-red-500/10 text-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {loading ? (
          <Card className="p-8 glass-card flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </Card>
        ) : (
          report && (
            <div className="space-y-6">
              <Card className="glass-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center mx-auto md:mx-0">
                  <div
                    className="absolute inset-0 rounded-full bg-slate-800/70 border border-yellow-500/20"
                    style={{
                      background: `conic-gradient(#facc15 ${Math.min(report.score || 0, 100)}%, rgba(255,255,255,0.04) 0%)`,
                    }}
                  />
                  <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center shadow-inner shadow-black/40">
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-5xl font-bold text-white bg-gradient-to-br ${scoreToColor(
                        report.score || 0
                      )} bg-opacity-20`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl">{Math.round(report.score || 0)}</span>
                        <span className="text-xs text-slate-200 tracking-wide">/100</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-semibold text-white">ATS Score</h3>
                  <p className="text-slate-300 leading-relaxed">{report.summary}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {breakdownEntries.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{item.label}</span>
                          <span>{Math.round(item.value || 0)}%</span>
                        </div>
                        <Progress value={item.value || 0} className="h-2 bg-slate-800" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="glass-card p-5 space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Strengths
                  </div>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    {report.strengths?.length
                      ? report.strengths.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))
                      : <li className="text-slate-500">No strengths detected.</li>}
                  </ul>
                </Card>

                <Card className="glass-card p-5 space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Gaps
                  </div>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    {report.gaps?.length
                      ? report.gaps.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))
                      : <li className="text-slate-500">No gaps detected.</li>}
                  </ul>
                  {report.keywordsToAdd?.length > 0 && (
                    <div className="pt-2 border-t border-yellow-500/20">
                      <p className="text-xs uppercase text-yellow-300 mb-2">Learn & upskill</p>
                      <div className="flex flex-wrap gap-2">
                        {report.keywordsToAdd.slice(0, 6).map((kw, idx) => (
                          <a
                            key={idx}
                            href={`https://www.coursera.org/search?query=${encodeURIComponent(kw)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-xs hover:bg-yellow-500/25 transition"
                          >
                            {kw}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="glass-card p-5 space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Keywords To Add
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.keywordsToAdd?.length
                      ? report.keywordsToAdd.map((kw, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-sm">
                            {kw}
                          </span>
                        ))
                      : <span className="text-slate-500 text-sm">No keyword suggestions.</span>}
                  </div>
                </Card>
              </div>

              <Card className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Recommendations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.recommendations?.length
                    ? report.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-slate-800/40 border border-yellow-500/20 text-sm text-slate-200">
                          {rec}
                        </div>
                      ))
                    : <p className="text-slate-500">No recommendations available.</p>}
                </div>
              </Card>

              {courseKeywords.length > 0 && (
                <Card className="glass-card p-5 space-y-4">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Courses to Upskill
                  </div>
                  <p className="text-slate-300 text-sm">
                    Curated searches across Coursera, Udemy, and edX based on your suggested keywords.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {courseKeywords.map((kw, idx) => (
                      <div key={idx} className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-yellow-500/15">
                        <p className="text-sm font-medium text-white">{kw}</p>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://www.coursera.org/search?query=${encodeURIComponent(kw)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-xs hover:bg-yellow-500/25 transition"
                          >
                            Coursera
                          </a>
                          <a
                            href={`https://www.udemy.com/courses/search/?q=${encodeURIComponent(kw)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-xs hover:bg-yellow-500/25 transition"
                          >
                            Udemy
                          </a>
                          <a
                            href={`https://www.edx.org/search?q=${encodeURIComponent(kw)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-xs hover:bg-yellow-500/25 transition"
                          >
                            edX
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

