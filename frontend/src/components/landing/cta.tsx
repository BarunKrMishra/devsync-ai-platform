import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { icon: Users, value: "2,500+", label: "Active Developers" },
  { icon: Zap, value: "50,000+", label: "API Calls Daily" },
  { icon: TrendingUp, value: "95%", label: "Time Saved" }
]

export function CTA() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Stats */}
          <div className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
              Ready to Transform Your
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Development Workflow?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building faster, 
              more reliable applications with DevSync. Start your free trial today.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-12">
            <Button size="lg" asChild className="group">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">
                Schedule Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
