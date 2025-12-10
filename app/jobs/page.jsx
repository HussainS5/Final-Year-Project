'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, DollarSign, Briefcase, Star, Filter, Clock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'Boston, MA', 'Seattle, WA'];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const filters = {
          search: searchQuery,
          type: selectedTypes.join(','),
          location: selectedLocations.join(',')
        };
        const data = await api.getJobs(filters);
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTypes, selectedLocations]);

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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Explore <span className="gradient-text">Opportunities</span>
          </h1>
          <p className="text-slate-400">
            Find your next career move from {jobs.length} available positions
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 glass-card text-white placeholder:text-slate-500 border-yellow-500/20 focus:border-yellow-500/50"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72">
            <Card className="glass-card p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-white text-lg">Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {jobTypes.map(type => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            setSelectedTypes(checked
                              ? [...selectedTypes, type]
                              : selectedTypes.filter(t => t !== type)
                            );
                          }}
                          className="border-yellow-500/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-yellow-400 transition-colors">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-yellow-500/20">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Location</h4>
                  <div className="space-y-2">
                    {locations.map(location => (
                      <label key={location} className="flex items-center space-x-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={(checked) => {
                            setSelectedLocations(checked
                              ? [...selectedLocations, location]
                              : selectedLocations.filter(l => l !== location)
                            );
                          }}
                          className="border-yellow-500/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-yellow-400 transition-colors">
                          {location}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {(selectedTypes.length > 0 || selectedLocations.length > 0) && (
                  <Button
                    variant="outline"
                    className="w-full glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-400"
                    onClick={() => {
                      setSelectedTypes([]);
                      setSelectedLocations([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job, index) => (
                  <Card
                    key={job.id}
                    className="relative glass-card p-6 hover:scale-[1.01] transition-all duration-300 group hover:shadow-xl hover:shadow-yellow-500/10"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <Badge className={`absolute top-4 right-4 ${getMatchColor(job.matchScore)} font-semibold px-3 py-1`}>
                      <Star className="w-3 h-3 mr-1" />
                      {job.matchScore}% Match
                    </Badge>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between lg:items-center">
                          <div>
                            <h3 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-slate-400 font-medium">{job.company}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.posted}</span>
                          </div>
                        </div>

                        <p className="text-slate-300 leading-relaxed">{job.description}</p>

                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="w-full lg:w-48 flex flex-col items-stretch gap-3 lg:items-end lg:text-right">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold hover:scale-105 transition-all w-full max-w-xs"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && jobs.length === 0 && (
              <Card className="glass-card p-12 text-center">
                <p className="text-slate-400 text-lg">
                  No jobs found matching your filters. Try adjusting your search criteria.
                </p>
              </Card>
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
