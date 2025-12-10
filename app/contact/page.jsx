'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'k224244@nu.edu.pk',
      link: 'mailto:k224244@nu.edu.pk'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+923092252566',
      link: 'tel:+923092252566'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'FAST-NUCES, Karachi Campus',
      link: '#'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: 'Mon - Fri: 9:00 AM - 6:00 PM',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mx-auto mb-8"></div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help! Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <Card
              key={index}
              className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center">
                  <info.icon className="w-7 h-7 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{info.title}</h3>
                {info.link !== '#' ? (
                  <a
                    href={info.link}
                    className="text-slate-400 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {info.details}
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm">{info.details}</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card p-8 md:p-10">
              <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  Send Us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-slate-300 mb-2">
                      Your Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-slate-900 border-slate-700 text-white focus:border-yellow-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-300 mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="bg-slate-900 border-slate-700 text-white focus:border-yellow-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-slate-300 mb-2">
                    Subject <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="bg-slate-900 border-slate-700 text-white focus:border-yellow-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-slate-300 mb-2">
                    Message <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    className="bg-slate-900 border-slate-700 text-white focus:border-yellow-500 min-h-[150px]"
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || submitted}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* FAQ Card */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Frequently Asked
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                    Response Time
                  </h4>
                  <p className="text-slate-400 text-sm">
                    We typically respond within 24-48 hours on business days.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                    Technical Support
                  </h4>
                  <p className="text-slate-400 text-sm">
                    For urgent technical issues, please include detailed information about your problem.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                    General Inquiries
                  </h4>
                  <p className="text-slate-400 text-sm">
                    For general questions, check our FAQ section or reach out directly.
                  </p>
                </div>
              </div>
            </Card>

            {/* Social Media Card */}
            {/* <Card className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Connect With Us
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Follow us on social media for updates and career tips.
              </p>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full glass-card border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 flex items-center justify-center transition-all"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full glass-card border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 flex items-center justify-center transition-all"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full glass-card border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 flex items-center justify-center transition-all"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </Card> */}

            {/* Location Map Card */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Our Location
              </h3>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.1883698437627!2d67.2610744!3d24.8568883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb3316c5276e35b%3A0x823a6a0100195ffd!2sFAST%20National%20University%20Karachi%20Campus!5e0!3m2!1sen!2s!4v1702202020202!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                ></iframe>
              </div>
            </Card>
          </div>
        </div>
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
