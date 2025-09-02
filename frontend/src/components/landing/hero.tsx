import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Zap, Database, Code, Plug } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
            <Zap className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              From Requirement to Integration in Days
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">AI Requirement</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Translator
            </span>
            <br />
            <span className="text-foreground">+ Universal API</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Connector
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            Transform business requirements into production-ready applications in days, not weeks.
            <br />
            <span className="font-semibold text-foreground">Define. Generate. Integrate.</span>
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="group">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo" className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">ERD Generation</h3>
              <p className="text-sm text-muted-foreground">
                Natural language to Entity Relationship Diagrams
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Code Generation</h3>
              <p className="text-sm text-muted-foreground">
                OpenAPI specs and boilerplate code
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">API Integration</h3>
              <p className="text-sm text-muted-foreground">
                100+ pre-built connectors with auth
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>
    </section>
  )
}
