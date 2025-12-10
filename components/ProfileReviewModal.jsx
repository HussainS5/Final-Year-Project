'use client';

import { useState, useEffect } from 'react';
import { Edit2, Plus, Trash2, Check, X as XIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

export function ProfileReviewModal({ open, onOpenChange, parsedData, userId, resumeId }) {
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    current_city: '',
    linkedin_url: '',
    github_url: '',
  });
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (parsedData && open) {
      // Initialize personal info
      setPersonalInfo({
        first_name: parsedData.personal_info?.first_name || '',
        last_name: parsedData.personal_info?.last_name || '',
        phone_number: parsedData.personal_info?.phone_number || '',
        current_city: parsedData.personal_info?.current_city || '',
        linkedin_url: parsedData.personal_info?.linkedin_url || '',
        github_url: parsedData.personal_info?.github_url || '',
      });

      // Initialize education
      setEducation(
        parsedData.education?.map((edu) => ({
          degree_type: edu.degree_type || 'bachelors',
          degree_title: edu.degree_title || '',
          institution_name: edu.institution_name || '',
          field_of_study: edu.field_of_study || '',
          start_date: edu.start_date || '',
          end_date: edu.end_date || '',
          is_current: edu.is_current || false,
          grade_cgpa: edu.grade_cgpa || null,
        })) || []
      );

      // Initialize work experience
      setWorkExperience(
        parsedData.work_experience?.map((exp) => ({
          job_title: exp.job_title || '',
          company_name: exp.company_name || '',
          employment_type: exp.employment_type || 'full_time',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          is_current: exp.is_current || false,
          description: exp.description || '',
        })) || []
      );

      // Initialize skills
      setSkills(
        parsedData.skills?.map((skillName) => ({
          name: skillName,
          proficiency: 'intermediate',
        })) || []
      );
    }
  }, [parsedData, open]);

  const validateDates = () => {
    const errors = [];

    // Validate education dates
    education.forEach((edu, index) => {
      if (!edu.start_date) {
        errors.push(`Education ${index + 1} (${edu.degree_title || 'Untitled'}): Please fill in the start date`);
      }
      if (!edu.is_current && !edu.end_date) {
        errors.push(`Education ${index + 1} (${edu.degree_title || 'Untitled'}): Please fill in the end date or check 'Currently Studying'`);
      }
    });

    // Validate work experience dates
    workExperience.forEach((exp, index) => {
      if (!exp.start_date) {
        errors.push(`Work Experience ${index + 1} (${exp.job_title || 'Untitled'}): Please fill in the start date`);
      }
      if (!exp.is_current && !exp.end_date) {
        errors.push(`Work Experience ${index + 1} (${exp.job_title || 'Untitled'}): Please fill in the end date or check 'Currently Working'`);
      }
    });

    return errors;
  };

  const handleUpdateProfile = async () => {
    try {
      // Validate dates before submission
      const errors = validateDates();
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Please fill in all required date fields');
        return;
      }

      setValidationErrors([]);
      setLoading(true);

      // API Call 1: Update user personal info
      const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalInfo),
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || 'Failed to update user info');
      }

      // API Call 2: Delete existing education and insert new ones
      await fetch(`${API_BASE_URL}/education/user/${userId}`, { method: 'DELETE' });
      const eduPromises = education.map((edu) =>
        fetch(`${API_BASE_URL}/education`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...edu, user_id: userId }),
        })
      );
      await Promise.all(eduPromises);

      // API Call 3: Delete existing experience and insert new ones
      await fetch(`${API_BASE_URL}/work-experience/user/${userId}`, { method: 'DELETE' });
      const expPromises = workExperience.map((exp) =>
        fetch(`${API_BASE_URL}/work-experience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...exp, user_id: userId }),
        })
      );
      await Promise.all(expPromises);

      // API Call 4: Handle skills
      await fetch(`${API_BASE_URL}/user-skills/user/${userId}`, { method: 'DELETE' });

      for (const skill of skills) {
        // Check if skill exists in catalog
        const catalogResponse = await fetch(
          `${API_BASE_URL}/skills-catalog/search?name=${encodeURIComponent(skill.name)}`
        );
        let skillId;

        if (catalogResponse.ok) {
          const catalogData = await catalogResponse.json();
          skillId = catalogData.skill_id;
        } else if (catalogResponse.status === 404) {
          // Skill doesn't exist, create it
          const newSkillResponse = await fetch(`${API_BASE_URL}/skills-catalog`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skill_name: skill.name,
              skill_category: 'technical',
            }),
          });
          if (newSkillResponse.ok) {
            const newSkill = await newSkillResponse.json();
            skillId = newSkill.skill?.skill_id || newSkill.skill_id;
          }
        }

        if (!skillId) {
          console.warn(`Could not find or create skill: ${skill.name}`);
          continue;
        }

        // Add to user_skills
        await fetch(`${API_BASE_URL}/user-skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            skill_id: skillId,
            proficiency_level: skill.proficiency || 'intermediate',
            years_of_experience: 0,
            source: 'resume_extracted',
          }),
        });
      }

      toast.success('Profile updated successfully!');
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        degree_type: 'bachelors',
        degree_title: '',
        institution_name: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        is_current: false,
        grade_cgpa: null,
      },
    ]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'is_current' && value) {
      updated[index].end_date = '';
    }
    setEducation(updated);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        job_title: '',
        company_name: '',
        employment_type: 'full_time',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
      },
    ]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'is_current' && value) {
      updated[index].end_date = '';
    }
    setWorkExperience(updated);
  };

  const removeExperience = (index) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const searchSkills = async (query) => {
    if (query.length < 2) {
      setSkillSuggestions([]);
      return;
    }
    try {
      // Use the existing search endpoint from server.js
      const response = await fetch(`${API_BASE_URL}/skills-catalog/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both array and single object responses
        setSkillSuggestions(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.error('Error searching skills:', error);
    }
  };

  const addSkill = (skillName) => {
    if (!skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSkills([...skills, { name: skillName, proficiency: 'intermediate' }]);
    }
    setSkillSearch('');
    setSkillSuggestions([]);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkillProficiency = (index, proficiency) => {
    const updated = [...skills];
    updated[index].proficiency = proficiency;
    setSkills(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Review Your Profile Information
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Please verify and edit the information extracted from your resume
          </DialogDescription>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h4 className="text-red-400 font-semibold mb-2">Please fix the following issues:</h4>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-300 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Section 1: Personal Information */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              <span className="text-sm text-slate-400">▼</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-slate-300">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    value={personalInfo.first_name}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, first_name: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-slate-300">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    value={personalInfo.last_name}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, last_name: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number" className="text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    value={personalInfo.phone_number}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, phone_number: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="current_city" className="text-slate-300">
                    Current City
                  </Label>
                  <Input
                    id="current_city"
                    value={personalInfo.current_city}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, current_city: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin_url" className="text-slate-300">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={personalInfo.linkedin_url}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, linkedin_url: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="github_url" className="text-slate-300">
                    GitHub URL
                  </Label>
                  <Input
                    id="github_url"
                    value={personalInfo.github_url}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, github_url: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 2: Education */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
              <h3 className="text-lg font-semibold text-white">
                Education ({education.length})
              </h3>
              <span className="text-sm text-slate-400">▼</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">
                      {edu.degree_title || `Education ${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      className="text-red-400 hover:text-red-300"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Degree Type</Label>
                      <Select
                        value={edu.degree_type}
                        onValueChange={(value) => updateEducation(index, 'degree_type', value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="bachelors">Bachelors</SelectItem>
                          <SelectItem value="masters">Masters</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Degree Title</Label>
                      <Input
                        value={edu.degree_title}
                        onChange={(e) => updateEducation(index, 'degree_title', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Institution</Label>
                      <Input
                        value={edu.institution_name}
                        onChange={(e) =>
                          updateEducation(index, 'institution_name', e.target.value)
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Field of Study</Label>
                      <Input
                        value={edu.field_of_study}
                        onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-slate-300">
                        Start Date <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={edu.start_date}
                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                        className={`bg-slate-900 text-white ${
                          !edu.start_date ? 'border-red-500/50' : 'border-slate-700'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">
                        End Date {!edu.is_current && <span className="text-red-400">*</span>}
                      </Label>
                      <Input
                        type="date"
                        value={edu.end_date}
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                        className={`bg-slate-900 text-white ${
                          !edu.is_current && !edu.end_date ? 'border-red-500/50' : 'border-slate-700'
                        }`}
                        disabled={edu.is_current || loading}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">CGPA</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={edu.grade_cgpa || ''}
                        onChange={(e) =>
                          updateEducation(index, 'grade_cgpa', parseFloat(e.target.value) || null)
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edu-current-${index}`}
                      checked={edu.is_current}
                      onChange={(e) => updateEducation(index, 'is_current', e.target.checked)}
                      className="rounded"
                      disabled={loading}
                    />
                    <Label htmlFor={`edu-current-${index}`} className="text-slate-300">
                      Currently Studying
                    </Label>
                  </div>
                </div>
              ))}
              <Button
                onClick={addEducation}
                variant="outline"
                className="w-full border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Education
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 3: Work Experience */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
              <h3 className="text-lg font-semibold text-white">
                Work Experience ({workExperience.length})
              </h3>
              <span className="text-sm text-slate-400">▼</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {workExperience.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">
                      {exp.job_title || `Experience ${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      className="text-red-400 hover:text-red-300"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Job Title</Label>
                      <Input
                        value={exp.job_title}
                        onChange={(e) => updateExperience(index, 'job_title', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Company Name</Label>
                      <Input
                        value={exp.company_name}
                        onChange={(e) => updateExperience(index, 'company_name', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Employment Type</Label>
                      <Select
                        value={exp.employment_type}
                        onValueChange={(value) => updateExperience(index, 'employment_type', value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">
                        Start Date <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        className={`bg-slate-900 text-white ${
                          !exp.start_date ? 'border-red-500/50' : 'border-slate-700'
                        }`}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">
                        End Date {!exp.is_current && <span className="text-red-400">*</span>}
                      </Label>
                      <Input
                        type="date"
                        value={exp.end_date}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        className={`bg-slate-900 text-white ${
                          !exp.is_current && !exp.end_date ? 'border-red-500/50' : 'border-slate-700'
                        }`}
                        disabled={exp.is_current || loading}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`exp-current-${index}`}
                          checked={exp.is_current}
                          onChange={(e) =>
                            updateExperience(index, 'is_current', e.target.checked)
                          }
                          className="rounded"
                          disabled={loading}
                        />
                        <Label htmlFor={`exp-current-${index}`} className="text-slate-300">
                          Currently Working
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={addExperience}
                variant="outline"
                className="w-full border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Experience
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 4: Skills */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
              <h3 className="text-lg font-semibold text-white">Skills ({skills.length})</h3>
              <span className="text-sm text-slate-400">▼</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={skillSearch}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      searchSkills(e.target.value);
                    }}
                    placeholder="Search or add skill..."
                    className="bg-slate-900 border-slate-700 text-white"
                    disabled={loading}
                  />
                  {skillSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                      {skillSuggestions.map((skill) => (
                        <button
                          key={skill.skill_id}
                          onClick={() => addSkill(skill.skill_name)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white"
                        >
                          {skill.skill_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (skillSearch.trim()) {
                      addSkill(skillSearch.trim());
                    }
                  }}
                  variant="outline"
                  className="border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30"
                  >
                    <span className="text-sm text-white">{skill.name}</span>
                    <Select
                      value={skill.proficiency}
                      onValueChange={(value) => updateSkillProficiency(index, value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-6 w-24 bg-slate-900 border-slate-700 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-400 hover:text-red-300"
                      disabled={loading}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Update Profile
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

