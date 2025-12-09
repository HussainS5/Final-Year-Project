'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Star, TrendingUp, Target, Award, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      const loadData = async () => {
        try {
          const data = await api.getUserStats(user.user_id);
          setDashboardData(data);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user]);

  const getMatchColor = (score) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getProgressColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!dashboardData || !user) return null;

  const jobs = dashboardData.recommendedJobs || [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-4">
            <Card className="glass-card p-6 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-950 font-bold text-lg">
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{user.full_name || 'User'}</h3>
                  <p className="text-sm text-slate-400">Job Seeker</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Profile Strength</span>
                    <span className="text-yellow-400 font-semibold">{dashboardData.profileStrength || 0}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all"
                      style={{ width: `${dashboardData.profileStrength || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-yellow-500/20 space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="text-white font-medium">{dashboardData.activeApplications || 0}</div>
                      <div className="text-slate-400 text-xs">Active Applications</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="text-white font-medium">{dashboardData.interviewsScheduled || 0}</div>
                      <div className="text-slate-400 text-xs">Interviews Scheduled</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="text-white font-medium">{dashboardData.matchRanking || 'N/A'}</div>
                      <div className="text-slate-400 text-xs">Match Ranking</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          <main className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Recommended <span className="gradient-text">Jobs</span>
              </h1>
              <p className="text-slate-400">
                Top matches based on your skills and experience
              </p>
            </div>

            {jobs.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Jobs Available</h3>
                <p className="text-slate-400">
                  Complete your profile to get personalized job recommendations
                </p>
                <Button
                  onClick={() => router.push('/profile')}
                  className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
                >
                  Complete Profile
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job, index) => (
                  <Card
                    key={job.id}
                    className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-yellow-500/10"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-slate-400 font-medium">{job.company}</p>
                          </div>

                          <Badge className={`${getMatchColor(job.matchScore)} font-semibold px-3 py-1`}>
                            <Star className="w-3 h-3 mr-1" />
                            {job.matchScore}% Match
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          {job.location && (
                            <div className="flex items-center text-slate-400">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                          )}
                          {job.jobType && (
                            <div className="flex items-center text-slate-400">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {job.jobType}
                            </div>
                          )}
                          {job.salary && (
                            <div className="flex items-center text-slate-400">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {job.salary}
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-slate-300 leading-relaxed line-clamp-2">{job.description}</p>
                        )}

                        {job.requiredSkills && (
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.split(',').slice(0, 5).map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 text-xs"
                              >
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="lg:w-32 flex lg:flex-col gap-2">
                        <div className="relative h-2 lg:h-24 lg:w-2 flex-1 lg:flex-none bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`absolute ${getProgressColor(job.matchScore)} rounded-full transition-all duration-1000 ease-out`}
                            style={{
                              width: '100%',
                              height: `${job.matchScore}%`,
                              bottom: 0,
                            }}
                          />
                        </div>
                        <Button
                          size="sm"
                          className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:scale-105 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                        >
                          View Job
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
