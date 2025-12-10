'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history on mount
  useEffect(() => {
    if (user?.user_id) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory(user.user_id);
      if (history.messages && history.messages.length > 0) {
        // Convert timestamps to Date objects
        const formattedMessages = history.messages.map((msg, idx) => ({
          id: idx + 1,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
        setSessionId(history.sessionId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !user?.user_id) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      console.log('Sending message to API:', inputValue);
      console.log('User ID:', user.user_id);
      console.log('Session ID:', sessionId);
      
      const response = await api.sendChatMessage(user.user_id, inputValue, sessionId);
      
      console.log('API Response:', response);
      
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.assistantMessage.content,
        timestamp: new Date(response.assistantMessage.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (sessionId && user?.user_id) {
      try {
        await api.endChatSession(user.user_id, sessionId);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    setMessages([]);
    setSessionId(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              AI Career <span className="gradient-text">Assistant</span>
            </h1>
            <p className="text-slate-400">
              Get personalized career advice powered by Gemini AI
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              onClick={handleClearChat}
              variant="outline"
              className="glass-card border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>

        <Card className="glass-card flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Bot className="w-10 h-10 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Welcome to AI Career Assistant</h3>
                  <p className="text-slate-400 max-w-md">
                    I'm here to help you with career advice, job searching tips, skill development, and more!
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 max-w-2xl">
                  <button
                    onClick={() => setInputValue('What skills should I learn to advance my career?')}
                    className="p-4 rounded-lg glass-card border border-yellow-500/20 hover:border-yellow-500/50 text-left transition-all"
                  >
                    <p className="text-white text-sm">💡 What skills should I learn?</p>
                  </button>
                  <button
                    onClick={() => setInputValue('How can I improve my resume?')}
                    className="p-4 rounded-lg glass-card border border-yellow-500/20 hover:border-yellow-500/50 text-left transition-all"
                  >
                    <p className="text-white text-sm">📄 How to improve my resume?</p>
                  </button>
                  <button
                    onClick={() => setInputValue('What jobs match my skills?')}
                    className="p-4 rounded-lg glass-card border border-yellow-500/20 hover:border-yellow-500/50 text-left transition-all"
                  >
                    <p className="text-white text-sm">🎯 Jobs matching my skills?</p>
                  </button>
                  <button
                    onClick={() => setInputValue('Tips for interview preparation?')}
                    className="p-4 rounded-lg glass-card border border-yellow-500/20 hover:border-yellow-500/50 text-left transition-all"
                  >
                    <p className="text-white text-sm">🎤 Interview preparation tips?</p>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant'
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <Bot className="w-5 h-5 text-slate-950" />
                    ) : (
                      <User className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'flex justify-end' : ''
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl backdrop-blur-xl ${
                        message.role === 'assistant'
                          ? 'bg-slate-800/60 border border-yellow-500/20'
                          : 'bg-yellow-500/20 border border-yellow-500/30'
                      }`}
                    >
                      <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-yellow-400 to-yellow-600">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-800/60 border border-yellow-500/20">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-yellow-500/20 bg-slate-900/40 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask me anything about your career..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 h-12 glass-card text-white placeholder:text-slate-500 border-yellow-500/20 focus:border-yellow-500/50"
                />
                <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-yellow-500" />
              </div>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-12 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-950 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>AI Online</span>
          </div>
          <span>•</span>
          <span>Powered by Gemini AI</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
}
