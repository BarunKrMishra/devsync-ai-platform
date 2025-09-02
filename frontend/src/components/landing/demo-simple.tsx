'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, CheckCircle } from 'lucide-react'

export function Demo() {
  const [activeStep, setActiveStep] = useState(1)

  const demoSteps = [
    {
      id: 1,
      title: "Paste Requirement",
      description: "Input your business requirements in natural language",
      content: "Create a user management system with authentication and profile management."
    },
    {
      id: 2,
      title: "Generate ERD",
      description: "DevSync suggests entities and relationships",
      content: "User entity with id, email, password, role, created_at fields."
    },
    {
      id: 3,
      title: "OpenAPI & Code",
      description: "Generates OpenAPI spec and starter backend",
      content: "Generated OpenAPI 3.0 specification with /api/users endpoints."
    }
  ]

  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            See DevSync in Action
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Watch how we transform a simple requirement into a production-ready application in minutes.
          </p>
          <Button size="lg">
            <Play className="mr-2 h-4 w-4" />
            Play Interactive Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-4 w-4" />
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

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{demoSteps[activeStep - 1].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {demoSteps[activeStep - 1].content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
