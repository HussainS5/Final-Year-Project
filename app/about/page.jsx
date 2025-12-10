'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Mail, Linkedin, Github, Award } from 'lucide-react';
import Image from 'next/image';

export default function About() {
  const teamMembers = [
    {
      name: 'Ms. Yusra Kaleem',
      role: 'Supervisor',
      image: '/photos/Ms-Yusra-Kaleem-Lecturer-CS.jpg',
      // bio: 'Computer science educator with focus on web technologies and databases.',
      email: 'yusra.kaleem@nu.edu.pk',
      linkedin: '#',
      github: '#'
    },
    {
      name: 'Ms. Saeeda Kanwal',
      role: 'Co-Supervisor',
      image: '/photos/Ms-Saeeda Kanwal-Doctor-AI.jpg',
      // bio: 'AI researcher specializing in machine learning and natural language processing.',
      email: 'saeeda.kanwal@nu.edu.pk',
      linkedin: '#',
      github: '#'
    },
    {
      name: 'Mr. Anas Shahid',
      role: 'Project Leader',
      image: '/photos/Mr-Anas-Shahid-Leader .jpeg',
      // bio: 'Experienced project leader with expertise in AI-driven solutions.',
      email: 'anashussain204@gmail.com',
      linkedin: 'https://www.linkedin.com/in/anas-shahid-73a254248/',
      github: 'https://github.com/AnasShahid204'
    },
    {
      name: 'Hussain Soomro',
      role: 'Team Member',
      image: '/photos/Hussain-Soomro-Member.jpg',
      // bio: 'Full-stack developer passionate about creating innovative solutions.',
      email: 'soomrohussain15@gmail.com',
      linkedin: 'https://www.linkedin.com/in/hussain-soomro-5998b6286',
      github: 'https://github.com/HussainS5'
    },
    {
      name: 'Muhammad Ahmed',
      role: 'Team Member',
      image: '/photos/Muhammad-Ahmed-Member.jpeg',
      // bio: 'Software engineer specializing in backend development and APIs.',
      email: 'k224482@nu.edu.pk',
      linkedin: 'https://www.linkedin.com/in/ahmed-khurram-386b5324a/',
      github: 'https://github.com/Ahmed4482'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About <span className="gradient-text">Our Team</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mx-auto mb-8"></div>
        </div>

        {/* Mission Statement */}
        <Card className="glass-card p-8 md:p-12 mb-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-slate-300 text-lg leading-relaxed text-center md:text-left">
              Welcome to NextGenAI, your ultimate AI-powered career companion. We are a dedicated team of 
              professionals committed to revolutionizing the job search experience through cutting-edge 
              artificial intelligence and machine learning technologies. Our mission is to empower job 
              seekers by providing personalized career guidance, intelligent job matching, and comprehensive 
              skill development recommendations. With a deep understanding of the modern job market and 
              advanced AI capabilities, we strive to bridge the gap between talented professionals and 
              their dream opportunities. Our platform leverages state-of-the-art natural language processing 
              and data analytics to deliver tailored insights, helping you navigate your career path with 
              confidence. We believe that everyone deserves access to smart, efficient, and personalized 
              career tools, and we're here to make that vision a reality. Join us on this journey to 
              transform the future of career development and unlock your full potential.
            </p>
          </div>
        </Card>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Meet Our <span className="gradient-text">Team</span>
          </h2>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Photo */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-500/30 hover:border-yellow-500 transition-all">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Name and Role */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-yellow-400 font-semibold text-sm mb-3">{member.role}</p>
                </div>

                {/* Bio */}
                <p className="text-slate-400 text-sm leading-relaxed">
                  {member.bio}
                </p>

                {/* Contact Info */}
                <div className="pt-4 border-t border-yellow-500/20 w-full">
                  <div className="flex items-center justify-center space-x-4">
                    <a
                      href={`mailto:${member.email}`}
                      className="w-10 h-10 rounded-full glass-card border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 flex items-center justify-center transition-all"
                      title="Email"
                    >
                      <Mail className="w-5 h-5 text-yellow-400" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full glass-card border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 flex items-center justify-center transition-all"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-yellow-400" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full glass-card border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 flex items-center justify-center transition-all"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5 text-yellow-400" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <Card className="glass-card p-8 mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h3>
          <p className="text-slate-400 mb-6">
            Join thousands of professionals who are already using NextGenAI to find their dream jobs.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold rounded-lg transition-all hover:scale-105"
          >
            Get Started Today
          </a>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
