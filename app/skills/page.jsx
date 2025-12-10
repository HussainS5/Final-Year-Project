'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Skills() {
  const { user } = useAuth();
  const [skillsData, setSkillsData] = useState({ strengths: [], gaps: [], radarData: [], atsReport: null });
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState('beginner');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSkills(user.user_id);
      setSkillsData(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (user?.user_id) {
      loadSkills();
    }
  }, [user, loadSkills]);

  const handleAddSkill = async () => {
    if (!newSkill || !user?.user_id) return;
    try {
      await api.addSkill(user.user_id, newSkill, newProficiency);
      setNewSkill('');
      setIsDialogOpen(false);
      loadSkills(); // Reload to show new skill and refresh view
    } catch (error) {
      console.error('Error adding skill:', error);
      alert(error.message);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?') || !user?.user_id) return;
    try {
      await api.deleteSkill(user.user_id, skillId);
      loadSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const sanitizeText = (text) =>
    (text || '')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const atsGaps = skillsData.atsReport?.gaps?.map(sanitizeText).filter(Boolean) || [];
  const gapItems = atsGaps.length > 0 ? atsGaps : skillsData.gaps;

  const atsRecs = skillsData.atsReport?.recommendations?.map(sanitizeText).filter(Boolean) || [];
  const recommendations = atsRecs.length > 0
    ? atsRecs
    : [
      'Focus on high-priority skills first to maximize career impact',
      'Dedicate 5-10 hours per week to skill development',
      'Apply new skills through hands-on projects and real-world scenarios',
    ];

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your <span className="gradient-text">Skill Profile</span>
            </h1>
            <p className="text-slate-400">
              Track your strengths and identify areas for growth
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-yellow-500/20 text-white">
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Skill Name</Label>
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. React, Python"
                    className="glass-card border-yellow-500/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proficiency</Label>
                  <Select value={newProficiency} onValueChange={setNewProficiency}>
                    <SelectTrigger className="glass-card border-yellow-500/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-yellow-500/20 text-white">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddSkill}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950"
                >
                  Add Skill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card p-8">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Top Strengths</h2>
            </div>

            <div className="space-y-6">
              {skillsData.strengths.length > 0 ? (
                skillsData.strengths.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="space-y-2 group"
                    style={{
                      animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-semibold">{skill.name}</span>
                        <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-400 text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-yellow-400 font-bold">{skill.level}%</span>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No skills added yet.</p>
              )}
            </div>
          </Card>

          <Card className="glass-card p-8">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Skill Radar</h2>
            </div>

            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData.radarData}>
                  <PolarGrid stroke="rgba(234, 179, 8, 0.2)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#eab308"
                    fill="#eab308"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="glass-card p-8">
          <div className="flex items-center space-x-2 mb-6">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Skill Gaps to Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gapItems.length > 0 ? (
              gapItems.map((gap, index) => (
                <Card
                  key={index}
                  className="glass-card p-6 hover:scale-105 transition-all duration-300 group hover:shadow-xl hover:shadow-yellow-500/10"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                        {typeof gap === 'string' ? gap : gap.name}
                      </h3>
                      {typeof gap === 'object' && gap.priority && (
                        <Badge className={getPriorityColor(gap.priority)}>
                          {gap.priority}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-slate-300 text-sm">
                      {typeof gap === 'object' && gap.description ? gap.description : 'Focus on closing this gap with targeted practice and learning.'}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-slate-400 col-span-full text-center py-8">No skill gaps identified yet. Great job!</p>
            )}
          </div>

          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Recommended Action Plan</h3>
                <ul className="space-y-2 text-slate-300">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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
