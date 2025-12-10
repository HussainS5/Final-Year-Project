'use client';

import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, UserCheck, AlertCircle, Mail, Calendar } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: FileText,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you create an account, we collect your name, email address, phone number, and professional details such as work experience, education, and skills. This information helps us provide personalized job recommendations and career guidance.'
        },
        {
          subtitle: 'Resume Data',
          text: 'When you upload your resume, we extract and process information including your qualifications, work history, skills, and contact details to enhance your profile and match you with relevant opportunities.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect information about your interactions with our platform, including pages visited, features used, job searches performed, and application history to improve our services.'
        }
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Job Matching',
          text: 'We use AI algorithms to analyze your profile and match you with relevant job opportunities based on your skills, experience, and career preferences.'
        },
        {
          subtitle: 'Career Recommendations',
          text: 'Your data helps us provide personalized career advice, skill development suggestions, and industry insights tailored to your professional goals.'
        },
        {
          subtitle: 'Platform Improvement',
          text: 'We analyze aggregated, anonymized data to enhance our AI models, improve user experience, and develop new features that benefit our community.'
        },
        {
          subtitle: 'Communication',
          text: 'We may send you job alerts, platform updates, and relevant career content based on your preferences. You can opt out of marketing communications at any time.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols to protect against unauthorized access.'
        },
        {
          subtitle: 'Secure Storage',
          text: 'Your personal information is stored on secure servers with restricted access, regular security audits, and automated backup systems to prevent data loss.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We implement strict access controls and authentication measures to ensure that only authorized personnel can access your data for legitimate business purposes.'
        }
      ]
    },
    {
      icon: Eye,
      title: 'Information Sharing',
      content: [
        {
          subtitle: 'With Employers',
          text: 'When you apply for a job, we share your profile information with the respective employer. You have control over which information is visible to potential employers.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We may share data with trusted third-party service providers who assist us in operating our platform, such as hosting services, analytics tools, and email providers.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information if required by law, court order, or government regulation, or to protect our rights and the safety of our users.'
        },
        {
          subtitle: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to this privacy policy.'
        }
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights and Choices',
      content: [
        {
          subtitle: 'Access and Update',
          text: 'You can access and update your personal information at any time through your account settings. We encourage you to keep your information accurate and current.'
        },
        {
          subtitle: 'Data Deletion',
          text: 'You have the right to request deletion of your account and associated data. Note that some information may be retained for legal or legitimate business purposes.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You can request a copy of your data in a machine-readable format, allowing you to transfer your information to another service if desired.'
        },
        {
          subtitle: 'Marketing Preferences',
          text: 'You can opt out of marketing communications while still receiving essential account-related notifications. Manage your preferences in account settings.'
        }
      ]
    },
    {
      icon: AlertCircle,
      title: 'Cookies and Tracking',
      content: [
        {
          subtitle: 'Essential Cookies',
          text: 'We use cookies that are necessary for the platform to function properly, including authentication, security, and basic functionality.'
        },
        {
          subtitle: 'Analytics Cookies',
          text: 'These cookies help us understand how users interact with our platform, allowing us to improve performance and user experience.'
        },
        {
          subtitle: 'Preference Cookies',
          text: 'We use cookies to remember your settings and preferences, providing a more personalized experience across sessions.'
        },
        {
          subtitle: 'Cookie Management',
          text: 'You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality.'
        }
      ]
    }
  ];

  const quickLinks = [
    {
      icon: Mail,
      title: 'Contact Us',
      description: 'Questions about privacy?',
      link: '/contact',
      linkText: 'Get in Touch'
    },
    {
      icon: Calendar,
      title: 'Last Updated',
      description: 'December 10, 2025',
      link: '#',
      linkText: 'View History'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30 mb-6">
            <Shield className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mx-auto mb-8"></div>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, protect, and share your personal information when you use NextGenAI.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {quickLinks.map((item, index) => (
            <Card
              key={index}
              className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-2">{item.description}</p>
                  {item.link !== '#' ? (
                    <a
                      href={item.link}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium inline-flex items-center transition-colors"
                    >
                      {item.linkText}
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-slate-500 text-sm">{item.linkText}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <Card
              key={sectionIndex}
              className="glass-card p-8 md:p-10"
              style={{
                animation: `fadeInUp 0.5s ease-out ${(sectionIndex + 2) * 0.1}s both`,
              }}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-7 h-7 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                </div>
              </div>

              <div className="space-y-6 ml-0 md:ml-[4.5rem]">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-2 border-yellow-500/20 pl-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.subtitle}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="glass-card p-8 mt-12 border-yellow-500/30">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Important Notice</h3>
              <div className="text-slate-400 space-y-2">
                <p>
                  By using NextGenAI, you acknowledge that you have read and understood this Privacy Policy. 
                  We may update this policy periodically to reflect changes in our practices or legal requirements.
                </p>
                <p>
                  We will notify you of any significant changes via email or through a prominent notice on our platform. 
                  Your continued use of our services after such modifications constitutes your acceptance of the updated policy.
                </p>
                <p className="font-semibold text-yellow-400 mt-4">
                  If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:k224244@nu.edu.pk" className="hover:text-yellow-300 underline transition-colors">
                    k224244@nu.edu.pk
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer CTA */}
        <Card className="glass-card p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-slate-400 mb-6">
            Join NextGenAI today and take control of your career journey with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold rounded-lg transition-all hover:scale-105"
            >
              Create Account
            </a>
            <a
              href="/contact"
              className="inline-block px-8 py-3 glass-card border border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white font-semibold rounded-lg transition-all hover:scale-105"
            >
              Contact Support
            </a>
          </div>
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
