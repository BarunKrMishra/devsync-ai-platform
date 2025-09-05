'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DevSync</h1>
                <p className="text-sm text-gray-600">From Requirement to Integration in Days</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Requirement Translator + Universal API Connector
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform natural language requirements into production-ready applications with intelligent microservices platform.
            <br />
            <span className="text-2xl font-semibold text-blue-600">Define. Generate. Integrate.</span>
          </p>
          
          {/* Visual: Requirements → ERD → APIs → Code → Integrations → Monitoring */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-bold">📝</span>
              </div>
              <p className="text-sm font-medium">Requirements</p>
            </div>
            <div className="text-blue-400">→</div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-bold">🗂️</span>
              </div>
              <p className="text-sm font-medium">ERD</p>
            </div>
            <div className="text-blue-400">→</div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-purple-600 font-bold">🔌</span>
              </div>
              <p className="text-sm font-medium">APIs</p>
            </div>
            <div className="text-blue-400">→</div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-orange-600 font-bold">💻</span>
              </div>
              <p className="text-sm font-medium">Code</p>
            </div>
            <div className="text-blue-400">→</div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-red-600 font-bold">🔗</span>
              </div>
              <p className="text-sm font-medium">Integrations</p>
            </div>
            <div className="text-blue-400">→</div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-indigo-600 font-bold">📊</span>
              </div>
              <p className="text-sm font-medium">Monitoring</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href="/dashboard">Start Free Trial</a>
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Teams lose weeks converting business requirements into schemas/APIs/tests, then more weeks on external API integrations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">⏰ Time Waste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">30–40% of sprint time wasted on translation & integrations</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">🔄 Broken Handoffs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Broken handoffs BA → Dev; code quality varies; onboarding new devs is slow</p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-600">🛠️ Fragmented Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Scope creep, rework, missed deadlines, fragmented tooling</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solution: DevSync</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Two powerful modules that transform your development workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Module A */}
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-blue-600 text-2xl">Module A — AI Requirement Translator</CardTitle>
                <CardDescription>Natural language → ERD, OpenAPI, test cases, boilerplate code</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>✅ Convert requirements to ERD diagrams</li>
                  <li>✅ Generate OpenAPI specifications</li>
                  <li>✅ Create comprehensive test cases</li>
                  <li>✅ Generate boilerplate code</li>
                  <li>✅ Support multiple frameworks</li>
                </ul>
                <Button className="mt-4 w-full">Try Translator</Button>
              </CardContent>
            </Card>

            {/* Module B */}
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600 text-2xl">Module B — Universal API Connector</CardTitle>
                <CardDescription>One SDK to integrate 100+ services with auth/retries/monitoring built-in</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>✅ 100+ pre-built connectors</li>
                  <li>✅ OAuth & authentication handling</li>
                  <li>✅ Automatic retries & error handling</li>
                  <li>✅ Built-in monitoring & logging</li>
                  <li>✅ Rate limiting & circuit breakers</li>
                </ul>
                <Button className="mt-4 w-full">Explore Connectors</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-xl font-semibold text-gray-900">
              Outcome: Idea → Production-ready MVP in days, not weeks
            </p>
          </div>
        </div>
      </section>

      {/* Product Demo Storyboard */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Demo</h2>
            <p className="text-lg text-gray-600">See DevSync in action</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Scene 1 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <CardTitle className="text-lg">1. Paste Requirement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Paste your natural language requirement text</p>
              </CardContent>
            </Card>

            {/* Scene 2 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗂️</span>
                </div>
                <CardTitle className="text-lg">2. Generate ERD</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">DevSync suggests Entities/Relations → renders ERD</p>
              </CardContent>
            </Card>

            {/* Scene 3 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔌</span>
                </div>
                <CardTitle className="text-lg">3. Generate APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Generates OpenAPI & starter backend (Node/Laravel/Java)</p>
              </CardContent>
            </Card>

            {/* Scene 4 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <CardTitle className="text-lg">4. Add Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Add "Slack alert on new signup" using api.sendMessage()</p>
              </CardContent>
            </Card>

            {/* Scene 5 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <CardTitle className="text-lg">5. Deploy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Run tests → green → deploy to production</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Choose the plan that fits your team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Freemium */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Freemium</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold text-gray-900">Free</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 10 generations/month</li>
                  <li>✅ 1k API calls/month</li>
                  <li>✅ Basic connectors</li>
                  <li>✅ Community support</li>
                </ul>
                <Button className="mt-4 w-full" variant="outline">Get Started</Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-blue-200 ring-2 ring-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-600">Pro</CardTitle>
                <CardDescription>For growing teams</CardDescription>
                <div className="text-3xl font-bold text-blue-600">$29<span className="text-lg text-gray-500">/user/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Unlimited generations</li>
                  <li>✅ 50k API calls/month</li>
                  <li>✅ All connectors</li>
                  <li>✅ Priority support</li>
                  <li>✅ Advanced templates</li>
                </ul>
                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">Start Pro Trial</Button>
              </CardContent>
            </Card>

            {/* Team */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Team</CardTitle>
                <CardDescription>For organizations</CardDescription>
                <div className="text-3xl font-bold text-green-600">$199<span className="text-lg text-gray-500">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 5 users included</li>
                  <li>✅ 250k API calls/month</li>
                  <li>✅ SSO integration</li>
                  <li>✅ Custom connectors</li>
                  <li>✅ Dedicated support</li>
                </ul>
                <Button className="mt-4 w-full" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-3xl font-bold text-purple-600">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Unlimited users</li>
                  <li>✅ Unlimited API calls</li>
                  <li>✅ Private deployment</li>
                  <li>✅ SLA guarantees</li>
                  <li>✅ Custom integrations</li>
                </ul>
                <Button className="mt-4 w-full" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Development Workflow?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who are building faster with DevSync
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <a href="/dashboard">Start Free Trial</a>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold">DevSync</span>
              </div>
              <p className="text-gray-400">From Requirement to Integration in Days</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Translator</li>
                <li>API Connector</li>
                <li>Code Generation</li>
                <li>Monitoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>SDKs</li>
                <li>Community</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DevSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}