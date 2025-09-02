import { 
  Brain, 
  Zap, 
  Shield, 
  GitBranch, 
  BarChart3, 
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "AI Requirement Translator",
    description: "Convert natural language requirements into ERDs, OpenAPI specs, and test cases automatically.",
    benefits: ["Natural language processing", "ERD generation", "OpenAPI creation", "Test case generation"]
  },
  {
    icon: Zap,
    title: "Universal API Connector",
    description: "One SDK to integrate 100+ services with built-in OAuth, retries, and monitoring.",
    benefits: ["100+ pre-built connectors", "OAuth 2.0 flows", "Retry logic", "Rate limiting"]
  },
  {
    icon: GitBranch,
    title: "Multi-Stack CodeGen",
    description: "Generate production-ready code for Node.js, Laravel, Java, and Python frameworks.",
    benefits: ["Multiple frameworks", "Customizable templates", "Dependency management", "Build scripts"]
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SSO/SAML, secrets vault, audit logs, and role-based permissions built-in.",
    benefits: ["SSO/SAML integration", "Secrets management", "Audit logging", "RBAC"]
  },
  {
    icon: BarChart3,
    title: "Real-time Monitoring",
    description: "Comprehensive observability with metrics, logging, tracing, and alerting.",
    benefits: ["Prometheus metrics", "Structured logging", "Distributed tracing", "Slack alerts"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Standardize BA→Dev handoffs and reduce integration toil across teams.",
    benefits: ["Shared templates", "Version control", "Team workspaces", "Collaboration tools"]
  }
]

const stats = [
  { label: "Time Saved", value: "30-40%", description: "of sprint time" },
  { label: "Integration Speed", value: "10x", description: "faster setup" },
  { label: "Code Quality", value: "95%", description: "consistency" },
  { label: "Onboarding", value: "3x", description: "faster for new devs" }
]

export function Features() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            Why DevSync?
          </h2>
          <p className="text-lg text-muted-foreground">
            Teams lose weeks converting business requirements into schemas/APIs/tests, 
            then more weeks on external API integrations. DevSync eliminates this friction.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 mb-16 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="mb-4 text-muted-foreground">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Problem Statement */}
        <div className="mt-16 rounded-lg border bg-destructive/5 p-8">
          <div className="flex items-start space-x-4">
            <Clock className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-destructive mb-2">
                The Problem We Solve
              </h3>
              <p className="text-muted-foreground mb-4">
                Teams waste 30-40% of sprint time on requirement translation and API integrations. 
                This leads to scope creep, rework, missed deadlines, and fragmented tooling.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Broken handoffs between Business Analysts and Developers</li>
                <li>• Inconsistent code quality across projects</li>
                <li>• Slow onboarding for new developers</li>
                <li>• Repetitive integration work for every project</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
