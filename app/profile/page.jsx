'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  GraduationCap,
  Edit,
  Upload,
  Save,
  X,
  Camera,
  Linkedin,
  Github,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { ResumeUploadModal } from '@/components/ResumeUploadModal';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Helper function to validate profile picture URL
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const urlObj = new URL(url);
      return ['http', 'https'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Get initials from name (first 2 letters)
  const getInitials = (firstName, lastName) => {
    let initials = '';
    if (firstName) initials += firstName[0].toUpperCase();
    if (lastName) initials += lastName[0].toUpperCase();
    return initials || 'U';
  };

  useEffect(() => {
    if (user?.user_id) {
      loadProfile();
    }
  }, [user]);

  const mockProfile = {
    profile_picture: '',
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    current_city: '',
    current_job: '',
    account_status: 'active',
    linkedin_url: '',
    github_url: '',
    bio: '',
    skills: [],
    education: [],
    work_experience: [],
  };

  const loadProfile = async () => {
    try {
      console.log('Loading profile for user_id:', user.user_id);
      const data = await api.getProfile(user.user_id);
      console.log('Profile data loaded:', data);
      console.log('Profile picture URL:', data.profile_picture);
      setProfile(data);
      setEditedProfile(data);
      // Reset error state when loading new profile
      setProfilePictureError(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadProfile();
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const userId = profile.user_id || user?.user_id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile with new picture URL
      setProfilePictureError(false);
      
      if (editing) {
        setEditedProfile(prev => ({
          ...prev,
          profile_picture: publicUrl
        }));
        toast.success('Profile picture uploaded! Remember to save changes.');
      } else {
        // Save immediately if not in edit mode
        await api.updateProfile(userId, {
          ...profile,
          profile_picture: publicUrl
        });
        toast.success('Profile picture uploaded successfully!');
        await loadProfile();
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = profile.user_id || user?.user_id; // Use user_id from loaded profile or auth context

      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('Saving profile for userId:', userId);
      console.log('Profile data:', editedProfile);

      // Update basic info
      const result = await api.updateProfile(userId, editedProfile);
      console.log('Profile update result:', result);

      // Update skills
      if (JSON.stringify(editedProfile.skills) !== JSON.stringify(profile.skills)) {
        console.log('Updating skills:', editedProfile.skills);
        await api.updateSkills(userId, editedProfile.skills);
      }

      // Reload profile to get updated data
      await loadProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.message);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map((s) => s.trim()).filter(Boolean);
    setEditedProfile((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...(editedProfile.education || [])];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEditedProfile((prev) => ({
      ...prev,
      education: newEducation,
    }));
  };

  const addEducation = () => {
    setEditedProfile((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { degree: '', institution: '', start_date: '', end_date: '', year: '' },
      ],
    }));
  };

  const removeEducation = (index) => {
    const newEducation = [...(editedProfile.education || [])];
    newEducation.splice(index, 1);
    setEditedProfile((prev) => ({
      ...prev,
      education: newEducation,
    }));
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const newWorkExperience = [...(editedProfile.work_experience || [])];
    newWorkExperience[index] = { ...newWorkExperience[index], [field]: value };
    
    // If marking as current, clear end date
    if (field === 'is_current' && value === true) {
      newWorkExperience[index].end_date = null;
    }
    
    setEditedProfile((prev) => ({
      ...prev,
      work_experience: newWorkExperience,
    }));
  };

  const addWorkExperience = () => {
    setEditedProfile((prev) => ({
      ...prev,
      work_experience: [
        ...(prev.work_experience || []),
        { title: '', company: '', start_date: '', end_date: '', is_current: false, description: '' },
      ],
    }));
  };

  const removeWorkExperience = (index) => {
    const newWorkExperience = [...(editedProfile.work_experience || [])];
    newWorkExperience.splice(index, 1);
    setEditedProfile((prev) => ({
      ...prev,
      work_experience: newWorkExperience,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayProfile = editing ? editedProfile : profile;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-slate-400">
              Manage your professional information and career preferences
            </p>
          </div>
          <div className="flex gap-3">
            {!editing ? (
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
                >
                  {saving ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Removed "Upload Resume" Card temporarily to simplify view or we can keep it. keeping as is. */}
        <Card className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Upload Your Resume</h3>
                <p className="text-sm text-slate-400">
                  Upload your resume to automatically update your profile with the latest information
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card p-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <input
                    type="file"
                    id="profile-picture-upload"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className="cursor-pointer block"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto text-slate-950 text-4xl font-bold overflow-hidden hover:opacity-90 transition-opacity">
                      {uploadingPicture ? (
                        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : displayProfile.profile_picture && !profilePictureError ? (
                        <img
                          src={displayProfile.profile_picture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', displayProfile.profile_picture);
                            setProfilePictureError(true);
                          }}
                          onLoad={() => console.log('Image loaded successfully:', displayProfile.profile_picture)}
                        />
                      ) : (
                        getInitials(displayProfile.first_name, displayProfile.last_name)
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-all shadow-lg">
                      <Camera className="w-5 h-5 text-slate-950" />
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-400">Click to upload profile picture</p>

                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300 text-sm">First Name</Label>
                      <Input
                        value={displayProfile.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="John"
                        className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-sm">Last Name</Label>
                      <Input
                        value={displayProfile.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Doe"
                        className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {displayProfile.first_name && displayProfile.last_name
                        ? `${displayProfile.first_name} ${displayProfile.last_name}`
                        : displayProfile.full_name || 'User'}
                    </h2>
                    <p className="text-slate-400">{displayProfile.current_job || "Add work experience to set current job"}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-yellow-500/20 space-y-3 text-left">
                  {editing ? (
                    <>
                      <div>
                        <Label className="text-slate-300 text-sm">Email</Label>
                        <Input
                          type="email"
                          value={displayProfile.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="email@example.com"
                          className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Phone Number</Label>
                        <Input
                          type="tel"
                          value={displayProfile.phone_number || ''}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          placeholder="+1 234 567 8900"
                          className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Date of Birth</Label>
                        <Input
                          type="date"
                          value={displayProfile.date_of_birth || ''}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Current City</Label>
                        <Input
                          value={displayProfile.current_city || ''}
                          onChange={(e) => handleInputChange('current_city', e.target.value)}
                          placeholder="San Francisco, CA"
                          className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-slate-300 text-sm">Note</Label>
                        <p className="text-xs text-slate-400 mt-1">
                          "Current Job" is automatically set from your current Work Experience.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {displayProfile.email && (
                        <div className="flex items-center space-x-3 text-sm">
                          <Mail className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-slate-300 break-all">{displayProfile.email}</span>
                        </div>
                      )}
                      {displayProfile.phone_number && (
                        <div className="flex items-center space-x-3 text-sm">
                          <Phone className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-slate-300">{displayProfile.phone_number}</span>
                        </div>
                      )}
                      {displayProfile.date_of_birth && (
                        <div className="flex items-center space-x-3 text-sm">
                          <Calendar className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-slate-300">{new Date(displayProfile.date_of_birth).toLocaleDateString()}</span>
                        </div>
                      )}
                      {displayProfile.current_city && (
                        <div className="flex items-center space-x-3 text-sm">
                          <MapPin className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-slate-300">{displayProfile.current_city}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-white">Account Status</h3>
              </div>
              {editing ? (
                <Select
                  value={displayProfile.account_status || 'active'}
                  onValueChange={(value) => handleInputChange('account_status', value)}
                >
                  <SelectTrigger className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-yellow-500/20">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className={`${displayProfile.account_status === 'active'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : displayProfile.account_status === 'inactive'
                      ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      : displayProfile.account_status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    } capitalize`}
                >
                  {displayProfile.account_status || 'active'}
                </Badge>
              )}
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-white">Skills</h3>
              </div>
              {editing ? (
                <div>
                  <Label className="text-slate-300 text-sm">Skills (comma separated)</Label>
                  <Textarea
                    value={displayProfile.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="JavaScript, React, Node.js, Python"
                    className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50 min-h-[100px]"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displayProfile.skills && displayProfile.skills.length > 0 ? (
                    displayProfile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No skills added yet</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-white">Personal Information</h3>
                </div>
              </div>

              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-slate-300 text-sm">Bio</Label>
                    <Textarea
                      value={displayProfile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50 min-h-[100px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-300 text-sm">Note</Label>
                    <p className="text-xs text-slate-400 mt-1">
                      "Current Job" is automatically set from your current Work Experience.
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">GitHub URL</Label>
                    <Input
                      value={displayProfile.github_url || ''}
                      onChange={(e) => handleInputChange('github_url', e.target.value)}
                      placeholder="https://github.com/username"
                      className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">LinkedIn URL</Label>
                    <Input
                      value={displayProfile.linkedin_url || ''}
                      onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">About</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {displayProfile.bio || 'No bio added yet'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-yellow-500/20">
                    {displayProfile.current_job && (
                      <div className="flex items-start space-x-3">
                        <Briefcase className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-400">Current Job</p>
                          <p className="text-white font-medium">{displayProfile.current_job}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(displayProfile.linkedin_url || displayProfile.github_url) && (
                    <div className="flex gap-3 pt-4 border-t border-yellow-500/20">
                      {displayProfile.linkedin_url && (
                        <a
                          href={displayProfile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all text-yellow-400"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                      {displayProfile.github_url && (
                        <a
                          href={displayProfile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all text-yellow-400"
                        >
                          <Github className="w-4 h-4" />
                          <span className="text-sm">GitHub</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-white">Work Experience</h3>
                </div>
                {editing && (
                  <Button
                    onClick={addWorkExperience}
                    size="sm"
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  >
                    Add Experience
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {editing ? (
                  displayProfile.work_experience && displayProfile.work_experience.length > 0 ? (
                    displayProfile.work_experience.map((exp, index) => (
                      <div key={index} className="p-4 rounded-lg glass-card border border-yellow-500/20 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-medium">Experience {index + 1}</h4>
                          <Button
                            onClick={() => removeWorkExperience(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-slate-300 text-sm">Job Title</Label>
                            <Input
                              value={exp.title || ''}
                              onChange={(e) => handleWorkExperienceChange(index, 'title', e.target.value)}
                              placeholder="Senior Developer"
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300 text-sm">Company</Label>
                            <Input
                              value={exp.company || ''}
                              onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                              placeholder="Tech Corp"
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300 text-sm">Start Date</Label>
                            <Input
                              type="date"
                              value={exp.start_date || ''}
                              onChange={(e) => handleWorkExperienceChange(index, 'start_date', e.target.value)}
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300 text-sm">End Date</Label>
                            <Input
                              type="date"
                              value={exp.end_date || ''}
                              onChange={(e) => handleWorkExperienceChange(index, 'end_date', e.target.value)}
                              disabled={exp.is_current}
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50 disabled:opacity-50"
                            />
                          </div>
                          <div className="md:col-span-2 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              checked={exp.is_current || false}
                              onChange={(e) => handleWorkExperienceChange(index, 'is_current', e.target.checked)}
                              className="w-4 h-4 rounded border-yellow-500/30 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                            />
                            <Label htmlFor={`current-${index}`} className="text-slate-300 text-sm cursor-pointer">
                              I currently work here
                            </Label>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-slate-300 text-sm">Description</Label>
                            <Textarea
                              value={exp.description || ''}
                              onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                              placeholder="Describe your responsibilities..."
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50 min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No work experience added yet</p>
                  )
                ) : displayProfile.work_experience && displayProfile.work_experience.length > 0 ? (
                  displayProfile.work_experience.map((exp, index) => (
                    <div
                      key={index}
                      className="relative pl-6 pb-6 border-l-2 border-yellow-500/20 last:pb-0"
                    >
                      <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-white">{exp.title}</h4>
                          <p className="text-yellow-400">{exp.company}</p>
                          <p className="text-sm text-slate-400">{exp.duration}</p>
                        </div>
                        <p className="text-slate-300 text-sm">{exp.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No work experience added yet</p>
                )}
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-white">Education</h3>
                </div>
                {editing && (
                  <Button
                    onClick={addEducation}
                    size="sm"
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  >
                    Add Education
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {editing ? (
                  displayProfile.education && displayProfile.education.length > 0 ? (
                    displayProfile.education.map((edu, index) => (
                      <div key={index} className="p-4 rounded-lg glass-card border border-yellow-500/20 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-medium">Education {index + 1}</h4>
                          <Button
                            onClick={() => removeEducation(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-slate-300 text-sm">Degree</Label>
                            <Input
                              value={edu.degree || ''}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300 text-sm">Institution</Label>
                            <Input
                              value={edu.institution || ''}
                              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                              placeholder="Stanford University"
                              className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-slate-300 text-sm">Start Date</Label>
                              <Input
                                type="date"
                                value={edu.start_date || ''}
                                onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                                className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300 text-sm">End Date (or Expected)</Label>
                              <Input
                                type="date"
                                value={edu.end_date || ''}
                                onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                                className="glass-card text-white border-yellow-500/20 focus:border-yellow-500/50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No education added yet</p>
                  )
                ) : displayProfile.education && displayProfile.education.length > 0 ? (
                  displayProfile.education.map((edu, index) => (
                    <div key={index} className="space-y-1">
                      <h4 className="font-semibold text-white">{edu.degree}</h4>
                      <p className="text-yellow-400">{edu.institution}</p>
                      <p className="text-sm text-slate-400">{edu.year}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No education added yet</p>
                )}
              </div>
            </Card>
          </div >
        </div >
      </div >

      <ResumeUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </div >
  );
}
