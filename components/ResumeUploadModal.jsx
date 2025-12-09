'use client';

import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

import { useAuth } from '@/components/AuthProvider';

export function ResumeUploadModal({ open, onOpenChange, onUploadSuccess }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const mockParsedData = {
        name: user?.full_name || 'User',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        location: 'San Francisco, CA',
        title: 'Senior Software Engineer',
        experienceYears: 5,
        bio: 'Experienced software engineer with a passion for building scalable applications.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'Stanford University',
            year: '2018',
          },
        ],
        workExperience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            duration: '2020 - Present',
            description: 'Leading development of cloud-based solutions',
          },
          {
            title: 'Software Engineer',
            company: 'StartUp Inc',
            duration: '2018 - 2020',
            description: 'Full-stack development',
          },
        ],
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            full_name: mockParsedData.name,
            email: mockParsedData.email,
            phone: mockParsedData.phone,
            location: mockParsedData.location,
            current_title: mockParsedData.title,
            experience_years: mockParsedData.experienceYears,
            bio: mockParsedData.bio,
            skills: mockParsedData.skills,
            education: mockParsedData.education,
            work_experience: mockParsedData.workExperience,
          },
        ])
        .select()
        .maybeSingle();

      if (profileError) throw profileError;

      const { error: resumeError } = await supabase.from('resumes').insert([
        {
          profile_id: profileData.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: '',
          parsed_data: mockParsedData,
          status: 'parsed',
        },
      ]);

      if (resumeError) throw resumeError;

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        localStorage.setItem('currentProfileId', profileData.id);
        onUploadSuccess?.(profileData);
        onOpenChange(false);
        setFile(null);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Upload Your Resume
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload your resume to automatically create your profile and get personalized job matches
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!file ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-yellow-500/30 hover:border-yellow-500/50 hover:bg-yellow-500/5'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-slate-400">
                    Supports PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-800/50 border border-yellow-500/20">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Uploading and parsing...</span>
                    <span className="text-yellow-400 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadProgress === 100 && (
                <div className="flex items-center space-x-2 text-green-400 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Resume uploaded successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="flex-1 glass-card border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
