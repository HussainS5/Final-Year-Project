'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Briefcase, Clock, Star, Building2, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockJobs } from '@/lib/mockData';

export default function JobDetailClient({ params }) {
  const router = useRouter();
  const job = mockJobs.find(j => j.id === parseInt(params.id));

  if (!job) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <Card className="glass-card p-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Job Not Found</h1>
          <p className="text-slate-400 mb-6">The job you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/jobs')} className="bg-yellow-500 hover:bg-yellow-600 text-slate-950">
            Back to Jobs
          </Button>
        </Card>
      </div>
    );
  }

  const getMatchColor = (score) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/jobs')}
          className="mb-6 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="space-y-6">
          <Card className="glass-card p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                    <p className="text-xl text-slate-400 font-medium">{job.company}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Briefcase className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{job.type}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{job.posted}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-4">
                <Badge className={`${getMatchColor(job.matchScore)} font-semibold px-4 py-2 text-base`}>
                  <Star className="w-4 h-4 mr-2" />
                  {job.matchScore}% Match
                </Badge>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold px-8 hover:scale-105 transition-all"
                >
                  Apply Now
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-yellow-500/20">
              <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
              <p className="text-slate-300 leading-relaxed mb-6">{job.description}</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Key Responsibilities</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Lead development of scalable applications and services</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Collaborate with cross-functional teams to define and ship new features</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Mentor junior developers and contribute to team growth</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Participate in code reviews and maintain high code quality standards</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>5+ years of professional software development experience</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Strong proficiency in modern programming languages and frameworks</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Experience with cloud platforms and distributed systems</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                      <span>Excellent problem-solving and communication skills</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 px-4 py-2 text-base"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">About the Company</h2>
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                {job.company} is a leading technology company dedicated to building innovative solutions that transform industries.
                We're committed to fostering a diverse and inclusive workplace where talented individuals can thrive and make a meaningful impact.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-slate-400">Company Size</p>
                    <p className="text-white font-medium">500-1000 employees</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-slate-400">Industry</p>
                    <p className="text-white font-medium">Technology</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-slate-400">Founded</p>
                    <p className="text-white font-medium">2015</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => router.push('/jobs')}
              variant="outline"
              className="flex-1 glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
            >
              Back to Jobs
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold hover:scale-105 transition-all"
            >
              Apply for this Position
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
