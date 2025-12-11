'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, DollarSign, Star, TrendingUp, Target, Award, Loader2,
  BookOpen, AlertCircle, CheckCircle2, Clock, BarChart3, PieChart, 
  FileText, User, Settings, ArrowRight, TrendingDown, Zap, GraduationCap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400';
      case 'interview': return 'bg-blue-500/20 text-blue-400';
      case 'shortlisted': return 'bg-purple-500/20 text-purple-400';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!dashboardData || !user) return null;

  const {
    user: userData,
    profileStrength,
    profileBreakdown,
    activeApplications,
    interviewsScheduled,
    matchRanking,
    skillsCount,
    recommendedJobs = [],
    skillGaps = [],
    learningPaths = [],
    applications = [],
    atsData,
    skillsDistribution
  } = dashboardData;

  // Use user data from dashboard or fallback to auth user
  const displayUser = userData || {
    firstName: user.full_name?.split(' ')[0] || 'User',
    lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
    fullName: user.full_name || 'User',
    email: user.email || ''
  };

  // Prepare chart data
  const skillsCategoryData = Object.entries(skillsDistribution?.byCategory || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value
  }));

  const skillsProficiencyData = Object.entries(skillsDistribution?.byProficiency || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const atsBreakdownData = atsData?.breakdown ? Object.entries(atsData.breakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    value: typeof value === 'number' ? value : 0
  })) : [];

  const profileBreakdownData = Object.entries(profileBreakdown || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    value: typeof value === 'number' ? value : 0
  }));

  const COLORS = ['#eab308', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, <span className="gradient-text">{displayUser?.firstName || displayUser?.fullName?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-slate-400">
              Here's your career dashboard overview
            </p>
          </div>
          <Button
            onClick={() => router.push('/profile')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
          >
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Profile Strength</p>
                <p className="text-2xl font-bold text-white">{profileStrength || 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Active Applications</p>
                <p className="text-2xl font-bold text-white">{activeApplications || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Interviews</p>
                <p className="text-2xl font-bold text-white">{interviewsScheduled || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Skills</p>
                <p className="text-2xl font-bold text-white">{skillsCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Completion Status */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                Profile Completion Status
              </h2>
              <p className="text-slate-400 text-sm mt-1">Complete your profile to get better job matches</p>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {profileStrength || 0}% Complete
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-300">Overall Progress</span>
                <span className="text-yellow-400 font-semibold">{profileStrength || 0}%</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`absolute top-0 left-0 h-full ${getProgressColor(profileStrength)} rounded-full transition-all duration-1000`}
                  style={{ width: `${profileStrength || 0}%` }}
                />
              </div>
            </div>

            {profileBreakdownData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {profileBreakdownData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-slate-400">{item.value.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profileBreakdownData.length > 0 && (
              <div className="mt-6">
                <ChartContainer config={{}} className="h-[200px]">
                  <BarChart data={profileBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#eab308" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </div>
        </Card>

        {/* ATS Report Section */}
        {atsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-500" />
                    ATS Score
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Your resume ATS compatibility</p>
                </div>
                <Badge className={`${getMatchColor(atsData.score)} font-semibold text-lg px-3 py-1`}>
                  {atsData.score.toFixed(0)}%
                </Badge>
              </div>

              {atsBreakdownData.length > 0 && (
                <ChartContainer config={{}} className="h-[250px]">
                  <BarChart data={atsBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#eab308" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}

              {atsData.summary && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-300 text-sm">{atsData.summary}</p>
                </div>
              )}
            </Card>

            <Card className="glass-card p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-yellow-500" />
                  ATS Breakdown
                </h2>
                <p className="text-slate-400 text-sm mt-1">Score distribution by category</p>
              </div>

              {atsBreakdownData.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={atsBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {atsBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No ATS breakdown data available
                </div>
              )}

              {atsData.strengths && atsData.strengths.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Key Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {atsData.strengths.slice(0, 3).map((strength, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400 text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Skills Distribution Charts */}
        {(skillsCategoryData.length > 0 || skillsProficiencyData.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skillsCategoryData.length > 0 && (
              <Card className="glass-card p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-yellow-500" />
                    Skills by Category
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Distribution of your skills</p>
                </div>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={skillsCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {skillsCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            )}

            {skillsProficiencyData.length > 0 && (
              <Card className="glass-card p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-500" />
                    Skills by Proficiency
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Your skill levels distribution</p>
                </div>
                <ChartContainer config={{}} className="h-[300px]">
                  <BarChart data={skillsProficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#eab308" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </Card>
            )}
          </div>
        )}

        {/* Recommended Jobs */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-yellow-500" />
                Recommended Jobs Based on Your Skills
              </h2>
              <p className="text-slate-400 text-sm mt-1">Top matches based on your profile</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/jobs')}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Jobs Available</h3>
              <p className="text-slate-400 mb-4">
                Complete your profile to get personalized job recommendations
              </p>
              <Button
                onClick={() => router.push('/profile')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
              >
                Complete Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recommendedJobs.slice(0, 5).map((job, index) => (
                <Card
                  key={job.id}
                  className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-yellow-500/10"
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
                            {job.jobType.replace('_', ' ')}
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
        </Card>

        {/* Active Applications */}
        {applications.length > 0 && (
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-500" />
                  Your Active Applications
                </h2>
                <p className="text-slate-400 text-sm mt-1">Track your application status</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {applications.length} Active
              </Badge>
            </div>

            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors cursor-pointer"
                  onClick={() => {
                    if (app.type === 'job') {
                      router.push(`/jobs/${app.entityId}`);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{app.title}</h3>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{app.organization}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Applied on {new Date(app.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Skill Gaps */}
        {skillGaps.length > 0 && (
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Your Skill Gaps
                </h2>
                <p className="text-slate-400 text-sm mt-1">Skills to improve for better opportunities</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {skillGaps.length} Gaps
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillGaps.slice(0, 6).map((gap) => (
                <div
                  key={gap.id}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{gap.skillName}</h3>
                    <Badge className={getSeverityColor(gap.severity)}>
                      {gap.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <span>{gap.currentLevel}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-yellow-400">{gap.targetLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Priority: {gap.priorityScore}/100</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                      onClick={() => router.push('/skills')}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Learning Progress */}
        {learningPaths.length > 0 && (
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-yellow-500" />
                  Your Learning Progress
                </h2>
                <p className="text-slate-400 text-sm mt-1">Track your skill development journey</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/skills')}
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="space-y-4">
              {learningPaths.map((path) => (
                <div key={path.id} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{path.name}</h3>
                      {path.targetRole && (
                        <p className="text-slate-400 text-sm">Target: {path.targetRole}</p>
                      )}
                    </div>
                    <Badge className={path.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {path.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">
                        {path.completedModules} of {path.totalModules} modules completed
                      </span>
                      <span className="text-yellow-400 font-semibold">
                        {path.completionPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000"
                        style={{ width: `${path.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </h2>
            <p className="text-slate-400 text-sm mt-1">Get things done faster</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => router.push('/profile')}
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm">Edit Profile</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => router.push('/jobs')}
            >
              <Briefcase className="w-6 h-6 mb-2" />
              <span className="text-sm">Browse Jobs</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => router.push('/skills')}
            >
              <BookOpen className="w-6 h-6 mb-2" />
              <span className="text-sm">Add Skills</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => router.push('/ats')}
            >
              <BarChart3 className="w-6 h-6 mb-2" />
              <span className="text-sm">ATS Report</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
