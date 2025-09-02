'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Database, 
  Code, 
  Plug, 
  Play, 
  CheckCircle,
  ArrowRight,
  Copy,
  Download
} from 'lucide-react'

const demoSteps = [
  {
    id: 1,
    title: "Paste Requirement",
    description: "Input your business requirements in natural language",
    icon: FileText,
    content: `Create a user management system with the following features:
- User registration and authentication
- Profile management with avatar upload
- Role-based access control (Admin, User, Guest)
- Password reset functionality
- User activity logging
- Email notifications for account events`,
    status: "completed"
  },
  {
    id: 2,
    title: "Generate ERD",
    description: "DevSync suggests entities and relationships",
    icon: Database,
    content: `Entities Generated:
- User (id, email, password, role, created_at, updated_at)
- Profile (id, user_id, first_name, last_name, avatar_url)
- Activity (id, user_id, action, timestamp, ip_address)
- Role (id, name, permissions)

Relationships:
- User has one Profile
- User has many Activities
- User belongs to one Role`,
    status: "completed"
  },
  {
    id: 3,
    title: "OpenAPI & Code",
    description: "Generates OpenAPI spec and starter backend",
    icon: Code,
    content: `Generated OpenAPI 3.0 specification with:
- /api/users endpoints (GET, POST, PUT, DELETE)
- /api/auth endpoints (login, register, reset-password)
- /api/profiles endpoints
- Authentication middleware
- Validation schemas

Starter code for Node.js/Express with:
- Prisma ORM setup
- JWT authentication
- Password hashing
- Input validation
- Error handling`,
    status: "completed"
  },
  {
    id: 4,
    title: "Add Integrations",
    description: "Connect external services with one line",
    icon: Plug,
    content: `Integration examples:
- Slack notifications: api.sendMessage('slack', { channel: '#alerts', text: 'New user registered' })
- Email service: api.sendEmail('sendgrid', { to: user.email, template: 'welcome' })
- File storage: api.uploadFile('aws-s3', { bucket: 'avatars', file: avatarFile })
- Analytics: api.trackEvent('mixpanel', { event: 'user_signup', userId: user.id })`,
    status: "completed"
  },
  {
    id: 5,
    title: "Test & Deploy",
    description: "Run tests and deploy to production",
    icon: CheckCircle,
    content: `Generated test suite includes:
- Unit tests for all endpoints
- Integration tests for database operations
- Authentication flow tests
- API integration tests

Deployment ready with:
- Docker configuration
- Environment variables setup
- CI/CD pipeline configuration
- Health check endpoints
- Monitoring setup`,
    status: "in_progress"
  }
]

export function Demo() {
  const [activeStep, setActiveStep] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayDemo = () => {
    setIsPlaying(true)
    let step = 1
    const interval = setInterval(() => {
      setActiveStep(step)
      step++
      if (step > demoSteps.length) {
        clearInterval(interval)
        setIsPlaying(false)
      }
    }, 3000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            See DevSync in Action
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Watch how we transform a simple requirement into a production-ready application in minutes.
          </p>
          <Button 
            size="lg" 
            onClick={handlePlayDemo}
            disabled={isPlaying}
            className="group"
          >
            <Play className="mr-2 h-4 w-4" />
            {isPlaying ? 'Playing Demo...' : 'Play Interactive Demo'}
          </Button>
        </div>

        {/* Demo Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step Navigation */}
          <div className="space-y-4">
            {demoSteps.map((step) => (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all ${
                  activeStep === step.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : step.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <demoSteps[activeStep - 1].icon className="h-5 w-5" />
                    <span>{demoSteps[activeStep - 1].title}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(demoSteps[activeStep - 1].content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {demoSteps[activeStep - 1].content}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {activeStep} of {demoSteps.length}</span>
              <div className="flex space-x-1">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index + 1 <= activeStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Ready to transform your development workflow?
          </p>
          <Button size="lg" className="group">
            Start Building Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
