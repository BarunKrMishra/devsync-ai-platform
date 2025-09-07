'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInModal } from '@/components/auth/SignInModal';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FadeIn, SlideIn, BounceIn, HoverScale, Typewriter, FloatingElement } from '@/components/ui/animations';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { isAuthenticated, user, signOut } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setShowSignUp(true);
    }
  };

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    router.push('/dashboard');
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DevSync
                </h1>
                <p className="text-sm text-gray-600 font-medium">From Requirement to Integration in Days</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.name}!
                  </span>
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSignIn(true)}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/15 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/30 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-purple-500/30 rounded-full animate-bounce-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-pink-500/30 rounded-full animate-bounce-slow" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <FadeIn delay={200}>
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                <Typewriter 
                  text="AI Requirement Translator +" 
                  speed={100}
                  className="block mb-4"
                />
                <span className="block gradient-text-rainbow animate-gradient-x">
                  Universal API Connector
                </span>
              </h1>
            </FadeIn>
            <SlideIn direction="up" delay={400}>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform natural language requirements into production-ready applications with our intelligent microservices platform.
                <br />
                <span className="text-3xl font-bold gradient-text-green animate-pulse-slow">
                  Define. Generate. Integrate. Deploy.
                </span>
              </p>
            </SlideIn>
            
            {/* Visual: Requirements → ERD → APIs → Code → Integrations → Monitoring */}
            <SlideIn direction="up" delay={600}>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-16">
                {[
                  { icon: '📝', label: 'Requirements', color: 'from-blue-500 to-blue-600', glow: 'shadow-glow' },
                  { icon: '🗂️', label: 'ERD', color: 'from-emerald-500 to-emerald-600', glow: 'shadow-glow-green' },
                  { icon: '🔌', label: 'APIs', color: 'from-purple-500 to-purple-600', glow: 'shadow-glow-purple' },
                  { icon: '💻', label: 'Code', color: 'from-orange-500 to-orange-600', glow: 'shadow-glow-orange' },
                  { icon: '🔗', label: 'Integrations', color: 'from-red-500 to-red-600', glow: 'shadow-glow-pink' },
                  { icon: '📊', label: 'Monitoring', color: 'from-indigo-500 to-indigo-600', glow: 'shadow-glow' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <FloatingElement intensity="medium" className="text-center group">
                      <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg ${item.glow} group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 hover-lift`}>
                        <span className="text-3xl animate-bounce-slow" style={{animationDelay: `${index * 0.2}s`}}>{item.icon}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{item.label}</p>
                    </FloatingElement>
                    {index < 5 && (
                      <div className="text-2xl text-gray-400 mx-2 md:mx-4 animate-ping-slow" style={{animationDelay: `${index * 0.3}s`}}>→</div>
                    )}
                  </div>
                ))}
              </div>
            </SlideIn>

            <BounceIn delay={800}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <HoverScale scale={1.05}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-glow-xl hover:shadow-glow-xl transition-all duration-500 transform hover:scale-105 px-8 py-4 text-lg font-bold animate-pulse-slow"
                  >
                    <a href="/dashboard" className="flex items-center gap-2">
                      <span className="animate-wiggle">🚀</span> Start Free Trial
                    </a>
                  </Button>
                </HoverScale>
                
                <HoverScale scale={1.05}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 shadow-glow-purple hover:shadow-glow-purple transition-all duration-500 transform hover:scale-105 px-8 py-4 text-lg font-bold glass-purple"
                    onClick={() => {
                      // Scroll to demo section
                      document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="animate-bounce">▶️</span> Watch Demo
                    </span>
                  </Button>
                </HoverScale>
              </div>
            </BounceIn>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Problem We Solve
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Teams lose weeks converting business requirements into schemas, APIs, and tests, then more weeks on external API integrations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⏰',
                title: 'Time Waste',
                description: '30–40% of sprint time wasted on translation & integrations',
                color: 'from-red-500 to-pink-500',
                bgColor: 'from-red-50 to-pink-50',
                borderColor: 'border-red-200'
              },
              {
                icon: '🔄',
                title: 'Broken Handoffs',
                description: 'Broken handoffs BA → Dev; code quality varies; onboarding new devs is slow',
                color: 'from-orange-500 to-yellow-500',
                bgColor: 'from-orange-50 to-yellow-50',
                borderColor: 'border-orange-200'
              },
              {
                icon: '🛠️',
                title: 'Fragmented Tools',
                description: 'Scope creep, rework, missed deadlines, fragmented tooling',
                color: 'from-yellow-500 to-amber-500',
                bgColor: 'from-yellow-50 to-amber-50',
                borderColor: 'border-yellow-200'
              }
            ].map((problem, index) => (
              <Card key={index} className={`${problem.borderColor} hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${problem.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span className="text-3xl">{problem.icon}</span>
                  </div>
                  <CardTitle className={`text-2xl bg-gradient-to-r ${problem.color} bg-clip-text text-transparent`}>
                    {problem.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative bg-dots">
        <div className="container mx-auto px-4">
          <FadeIn delay={200}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="gradient-text-blue">Our Solution:</span> DevSync
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Two powerful modules that transform your development workflow
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Module A */}
            <SlideIn direction="left" delay={400}>
              <Card className="border-blue-200 hover:shadow-glow hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group bg-gradient-to-br from-blue-50 to-indigo-50 hover-lift">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <span className="text-4xl">🤖</span>
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Requirement Translator
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-4">
                  Natural language → ERD, OpenAPI, test cases, boilerplate code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-gray-700">
                  {[
                    'Convert requirements to ERD diagrams',
                    'Generate OpenAPI specifications',
                    'Create comprehensive test cases',
                    'Generate boilerplate code',
                    'Support multiple frameworks'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 py-3 text-lg">
                  Try Translator
                </Button>
              </CardContent>
            </Card>
            </SlideIn>

            {/* Module B */}
            <SlideIn direction="right" delay={600}>
              <Card className="border-green-200 hover:shadow-glow-green hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group bg-gradient-to-br from-green-50 to-emerald-50 hover-lift">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <span className="text-4xl">🔌</span>
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Universal API Connector
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-4">
                  One SDK to integrate 100+ services with auth/retries/monitoring built-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-gray-700">
                  {[
                    '100+ pre-built connectors',
                    'OAuth & authentication handling',
                    'Automatic retries & error handling',
                    'Built-in monitoring & logging',
                    'Rate limiting & circuit breakers'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 py-3 text-lg">
                  Explore Connectors
                </Button>
              </CardContent>
            </Card>
            </SlideIn>
          </div>
          
          <div className="text-center mt-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-2xl">
              <div className="bg-white px-8 py-4 rounded-xl">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Outcome: Idea → Production-ready MVP in days, not weeks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo Storyboard */}
      <section id="demo-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See DevSync in Action
            </h2>
            <p className="text-xl text-gray-600">Watch how we transform your workflow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { icon: '📝', title: 'Paste Requirement', description: 'Paste your natural language requirement text', color: 'from-blue-500 to-blue-600' },
              { icon: '🗂️', title: 'Generate ERD', description: 'DevSync suggests Entities/Relations → renders ERD', color: 'from-emerald-500 to-emerald-600' },
              { icon: '🔌', title: 'Generate APIs', description: 'Generates OpenAPI & starter backend (Node/Laravel/Java)', color: 'from-purple-500 to-purple-600' },
              { icon: '🔗', title: 'Add Integrations', description: 'Add "Slack alert on new signup" using api.sendMessage()', color: 'from-orange-500 to-orange-600' },
              { icon: '🚀', title: 'Deploy', description: 'Run tests → green → deploy to production', color: 'from-red-500 to-red-600' }
            ].map((step, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                <CardHeader>
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{index + 1}. {step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                name: 'Freemium',
                description: 'Perfect for getting started',
                price: 'Free',
                features: ['10 generations/month', '1k API calls/month', 'Basic connectors', 'Community support'],
                buttonText: 'Get Started',
                buttonStyle: 'outline',
                popular: false
              },
              {
                name: 'Pro',
                description: 'For growing teams',
                price: '$29',
                priceUnit: '/user/mo',
                features: ['Unlimited generations', '50k API calls/month', 'All connectors', 'Priority support', 'Advanced templates'],
                buttonText: 'Start Pro Trial',
                buttonStyle: 'gradient',
                popular: true,
                gradient: 'from-blue-600 to-purple-600'
              },
              {
                name: 'Team',
                description: 'For organizations',
                price: '$199',
                priceUnit: '/mo',
                features: ['5 users included', '250k API calls/month', 'SSO integration', 'Custom connectors', 'Dedicated support'],
                buttonText: 'Contact Sales',
                buttonStyle: 'outline',
                popular: false
              },
              {
                name: 'Enterprise',
                description: 'For large organizations',
                price: 'Custom',
                features: ['Unlimited users', 'Unlimited API calls', 'Private deployment', 'SLA guarantees', 'Custom integrations'],
                buttonText: 'Contact Sales',
                buttonStyle: 'outline',
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`${plan.popular ? 'ring-2 ring-blue-500 shadow-2xl transform scale-105' : 'hover:shadow-xl'} transition-all duration-300 transform hover:scale-105 group`}>
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="text-4xl font-bold text-gray-900 mt-4">
                    {plan.price}
                    {plan.priceUnit && <span className="text-lg text-gray-500">{plan.priceUnit}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-3 text-lg ${
                      plan.buttonStyle === 'gradient' 
                        ? `bg-gradient-to-r ${plan.gradient} hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl` 
                        : 'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    } transition-all duration-300 transform hover:scale-105`}
                    variant={plan.buttonStyle === 'gradient' ? 'default' : 'outline'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto">
            Join thousands of developers who are building faster with DevSync
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-bold">
              <a href="/dashboard" className="flex items-center gap-2">
                🚀 Start Free Trial
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-bold">
              📅 Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-2xl font-bold">DevSync</span>
              </div>
              <p className="text-gray-400 leading-relaxed">From Requirement to Integration in Days</p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">AI Translator</li>
                <li className="hover:text-white transition-colors cursor-pointer">API Connector</li>
                <li className="hover:text-white transition-colors cursor-pointer">Code Generation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Monitoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">API Reference</li>
                <li className="hover:text-white transition-colors cursor-pointer">SDKs</li>
                <li className="hover:text-white transition-colors cursor-pointer">Community</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DevSync. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modals */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
        onSignInSuccess={handleSignInSuccess}
      />

      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
        onSignUpSuccess={handleSignUpSuccess}
      />
    </div>
  );
}