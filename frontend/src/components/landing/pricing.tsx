import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Zap } from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out DevSync",
    features: [
      "10 AI generations per month",
      "1,000 API calls per month",
      "Basic ERD generation",
      "Community support",
      "5 projects maximum"
    ],
    limitations: [
      "Limited to basic templates",
      "No team collaboration",
      "Basic monitoring"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "per user/month",
    description: "For individual developers and small teams",
    features: [
      "Unlimited AI generations",
      "50,000 API calls per month",
      "Advanced ERD generation",
      "All code templates (Node, Laravel, Java)",
      "Priority support",
      "Unlimited projects",
      "Basic team collaboration",
      "Advanced monitoring"
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Team",
    price: "$199",
    period: "per month",
    description: "For growing teams and agencies",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "250,000 API calls per month",
      "SSO/SAML integration",
      "Advanced team collaboration",
      "Custom templates",
      "Dedicated support",
      "Audit logs",
      "Custom integrations"
    ],
    limitations: [],
    cta: "Start Team Trial",
    popular: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations with specific needs",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "Unlimited API calls",
      "Private deployment options",
      "Custom SLAs",
      "24/7 dedicated support",
      "Compliance certifications",
      "Custom connectors",
      "On-premise deployment"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false
  }
]

const addOns = [
  {
    name: "Premium Connectors",
    description: "Access to 50+ premium API connectors",
    price: "$10/month"
  },
  {
    name: "Dedicated Templates",
    description: "Custom code templates for your stack",
    price: "$25/month"
  },
  {
    name: "Priority Support",
    description: "24/7 support with 1-hour response time",
    price: "$50/month"
  }
]

export function Pricing() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <li key={limitationIndex} className="text-sm text-muted-foreground">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addOn, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{addOn.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{addOn.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-4">{addOn.price}</div>
                  <Button variant="outline" className="w-full">
                    Add to Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What happens to my data if I cancel?</h4>
              <p className="text-muted-foreground text-sm">
                Your data is safe. You can export all your projects and configurations before canceling.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you offer custom pricing?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, we offer custom pricing for enterprise customers with specific requirements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, all paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
